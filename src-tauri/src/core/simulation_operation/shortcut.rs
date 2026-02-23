use base64::{engine::general_purpose, Engine as _};
use screenshots::Screen;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};

pub fn handle_shortcut(app: AppHandle, route_path: &str) {
    // 1. 获取所有屏幕
    let screens = Screen::all().unwrap_or_default();
    if screens.is_empty() {
        eprintln!("未找到显示器");
        return;
    }

    // 2. 找到主屏幕（或者直接取第一个）
    let primary_screen = screens
        .iter()
        .find(|s| s.display_info.is_primary)
        .unwrap_or(&screens[0]);

    // 3. 捕获完整屏幕
    // 注意：capture() 在 Windows 上会自动处理 DPI 抓取完整的物理分辨率
    let screenshot_image = match primary_screen.capture() {
        Ok(img) => img,
        Err(e) => {
            eprintln!("截图失败: {}", e);
            return;
        }
    };

    let png_bytes = screenshot_image.to_png().unwrap();
    let base64_string = general_purpose::STANDARD.encode(&png_bytes);
    let data_url = format!("data:image/png;base64,{}", base64_string);

    // 4. 获取屏幕的物理尺寸，用于设置窗口
    let width = primary_screen.display_info.width;
    let height = primary_screen.display_info.height;
    let x = primary_screen.display_info.x;
    let y = primary_screen.display_info.y;

    // 5. 窗口处理
    let label = "tool-screenshot";
    if let Some(win) = app.get_webview_window(label) {
        // 如果窗口已存在，确保它在正确的位置和大小
        let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
        let _ = win.set_size(tauri::PhysicalSize::new(width, height));
        let _ = win.show();
        let _ = win.set_focus();
        let _ = win.emit("init-screenshot", (route_path, data_url));
    } else {
        let win_builder = tauri::WebviewWindowBuilder::new(
            &app,
            label,
            tauri::WebviewUrl::App(format!("/plugin/{}", route_path).into()),
        )
        .position(x as f64, y as f64) // 注意：builder 接受的是逻辑坐标或物理坐标取决于配置，这里建议build后强制设置一次
        .inner_size(width as f64, height as f64)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .fullscreen(false) // 先不设置全屏，手动控制物理大小更稳
        .visible(false);

        if let Ok(win) = win_builder.build() {
            // 强制设置为物理像素大小，防止被系统逻辑缩放截断
            let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
            let _ = win.set_size(tauri::PhysicalSize::new(width, height));
            let _ = win.show();
            let _ = win.emit("init-screenshot", (route_path, data_url));
        }
    }
}
