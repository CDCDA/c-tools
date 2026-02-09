use base64::{engine::general_purpose, Engine as _};
use mouse_position::mouse_position::Mouse;
use postgres::fallible_iterator::Map;
use screenshots::Screen;

use std::{env, fs};
use tauri::{AppHandle, Emitter, Manager};
pub fn handle_shortcut(app: AppHandle, route_path: &str) {
    // 1. 获取鼠标当前所在的坐标
    // 注意：这里使用的是 Mouse::get_position() 而不是 mouse_position()
    let position = Mouse::get_mouse_position();
    let (mouse_x, mouse_y) = match position {
        Mouse::Position { x, y } => (x, y),
        Mouse::Error => {
            eprintln!("无法获取鼠标位置，尝试获取主屏幕");
            // 如果获取不到鼠标位置，可以设为 (0,0) 或者后续逻辑处理
            (0, 0)
        }
    };
    // 2. 根据鼠标坐标获取对应的屏幕
    let screen = match Screen::from_point(mouse_x, mouse_y) {
        Ok(s) => s,
        Err(_) => {
            // 如果坐标处没找到屏幕，尝试获取主屏幕
            let all_screens = Screen::all().unwrap();
            all_screens
                .into_iter()
                .find(|s| s.display_info.is_primary)
                .unwrap_or_else(|| {
                    // 如果连主屏都找不到，就取列表里的第一个
                    Screen::all().unwrap()[0].clone()
                })
        }
    };

    // // 3. 捕获该屏幕
    let screenshot_image = match screen.capture() {
        Ok(img) => img,
        Err(e) => {
            eprintln!("捕获屏幕失败: {}", e);
            return;
        }
    };
    // 2. 捕获屏幕并转为 PNG 字节流 (PNG 压缩虽然耗一点 CPU，但比发送原始 RGBA 的 JSON 字符串快得多)
    // 编码为 PNG
    // 4. 将图像编码为 PNG
    let png_bytes = match screenshot_image.to_png() {
        Ok(bytes) => bytes,
        Err(e) => {
            eprintln!("编码 PNG 失败: {}", e);
            return;
        }
    };

    let base64_string = general_purpose::STANDARD.encode(&png_bytes);
    // let screenshot_image = screen.capture().map_err(|e| e.to_string()).unwrap();
    // let buffer = screenshot_image.to_png().unwrap();

    // // 3. 写入临时文件
    // let mut path = env::temp_dir();
    // path.push(format!(
    //     "tauri_cap_{}.png",
    //     std::time::SystemTime::now()
    //         .duration_since(std::time::UNIX_EPOCH)
    //         .unwrap()
    //         .as_millis()
    // ));
    // fs::write(&path, buffer).unwrap();

    // let path_str = path.to_string_lossy().to_string();
    // eprintln!("截图临时文件地址: {}", path_str);

    // 4. 获取预创好的窗口
    if let Some(win) = app.get_webview_window("tool-screenshot") {
        // 发送路径和base64编码
        win.emit(
            "init-screenshot",
            (
                route_path,
                format!("data:image/png;base64,{}", base64_string),
            ),
        )
        .unwrap();
    } else {
        let _screenshot_win = tauri::WebviewWindowBuilder::new(
            &app,
            "tool-screenshot", // 给它一个固定的 label
            tauri::WebviewUrl::App(format!("http://localhost:1420/plugin/{}", route_path).into()), // 指向你的截图路由
        )
        .visible(false)
        .fullscreen(true)
        .always_on_top(true)
        .transparent(true)
        .decorations(false)
        .skip_taskbar(true)
        .build();
        if let Some(win) = app.get_webview_window("tool-screenshot") {
            // 发送路径和base64编码
            win.emit(
                "init-screenshot",
                (
                    route_path,
                    format!("data:image/png;base64,{}", base64_string),
                ),
            )
            .unwrap();
        }
    }
}
