#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod commands;
mod core;
use commands::color_commands::{
    capture_area, capture_full_screen, capture_magnifier_area, get_color_at_cursor,
};

use commands::db_command::{get_all_tables, get_table_columns, test_db_connection};
use commands::file_commands::{
    calculate_file_hash, list_directory_recursively_jwalk, move_file, open_folder, read_file,
    remove_file, write_file,
};
use commands::mouse_commands::{
    get_mouse_position,
    start_color_picking,
    stop_color_picking,
    AppState, // 确保 AppState 可访问
};
use commands::simulation_operation_commands::{paste, shortcut};
use commands::system_commands::{get_system_info, set_app_fullscreen};
use commands::translate_commands::translate_text;
use core::system::tray::create_tray;

use enigo::Mouse;
use std::thread;
use std::time::{Duration, Instant};
use tauri::menu::MenuBuilder;
use tauri::Emitter;
use tauri::Manager; // 确保 Emitter trait 导入

#[cfg(desktop)]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        // 管理 AppState 实例。这会在 Tauri 应用启动时创建 AppState。
        // 确保 AppState::new() 方法返回一个适合用于状态管理的对象。
        .manage(commands::mouse_commands::AppState::new())
        .invoke_handler(tauri::generate_handler![
            calculate_file_hash,
            get_system_info,
            list_directory_recursively_jwalk,
            read_file,
            write_file,
            move_file,
            remove_file,
            open_folder,
            paste,
            shortcut,
            get_color_at_cursor,
            capture_magnifier_area,
            get_mouse_position,
            start_color_picking,
            stop_color_picking,
            capture_full_screen,
            set_app_fullscreen,
            test_db_connection,
            get_all_tables,
            get_table_columns,
            capture_area,
            translate_text
        ])
        .setup(|app| {
            // 预创一个隐藏的截图窗口
            let _screenshot_win = tauri::WebviewWindowBuilder::new(
                app,
                "tool-screenshot", // 给它一个固定的 label
                tauri::WebviewUrl::App("http://localhost:1420/plugin/screenshot".into()), // 指向你的截图路由
            )
            .visible(false)
            .fullscreen(true)
            .always_on_top(false)
            .transparent(true)
            .decorations(false)
            .skip_taskbar(true)
            .build()?;
            let menu = MenuBuilder::new(app)
                .text("open", "Open")
                .text("close", "Close")
                .check("check_item", "Check Item")
                .separator()
                .text("disabled_item", "Disabled Item")
                .text("status", "Status: Processing...")
                .build()?;

            app.set_menu(menu.clone())?;

            // Update individual menu item text
            menu.get("status")
                .unwrap()
                .as_menuitem_unchecked()
                .set_text("Status: Ready")?;
            create_tray(&app.app_handle())?;

            // ------------------ 解决 E0521 错误的关键 ------------------
            // 从 app 获取管理的状态。
            // tauri::State<T> 是对 T 的一个包装，用于安全地访问管理状态。
            // AppState 内部应该已经使用了 Arc<Mutex<T>> 来保证线程安全。
            let app_state_instance = app.state::<AppState>();

            // 克隆 AppState 内部的 Arc<Mutex>。
            // 假设 AppState 内部的 `is_picking` 和 `mouse_state` 都是 Arc<Mutex<...>>。
            // 我们需要为线程独立克隆这些 Arc。
            let is_picking_arc = app_state_instance.is_picking.clone();
            let mouse_state_arc = app_state_instance.mouse_state.clone();

            let app_handle = app.app_handle().clone(); // 克隆 app_handle 以便移动到线程

            // 高性能鼠标监听线程
            std::thread::spawn(move || {
                #[cfg(target_os = "windows")]
                let enigo = {
                    use enigo::{Enigo, Settings};
                    Enigo::new(&Settings::default()).unwrap()
                };
                let mut last_emitted_pos = (0, 0);

                loop {
                    let is_picking = {
                        // 在线程内部锁定 Mutex
                        let picking = is_picking_arc.lock().unwrap();
                        *picking
                    };

                    if is_picking {
                        let current_pos_result = enigo.location();

                        // 更新鼠标状态（总是更新，用于get_mouse_position）
                        if let Ok(current_pos) = current_pos_result {
                            let mut mouse_state = mouse_state_arc.lock().unwrap();
                            mouse_state.x = current_pos.0;
                            mouse_state.y = current_pos.1;
                            mouse_state.last_update = Some(Instant::now());

                            let should_emit = current_pos != last_emitted_pos;

                            if should_emit {
                                // 使用 app_handle 发送事件
                                let _ = app_handle.emit("mouse-moved", current_pos);
                                last_emitted_pos = current_pos;
                            }
                        }

                        // 动态调整轮询频率
                        thread::sleep(Duration::from_millis(10)); // 125fps 高精度模式
                    } else {
                        // 非取色模式，降低频率节省资源
                        thread::sleep(Duration::from_millis(1000)); // 10fps
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("运行Tauri应用失败");
}
