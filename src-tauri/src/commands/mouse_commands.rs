use std::time::Instant;
use tauri::State;

use std::sync::{Arc, Mutex};

#[derive(Default)]
pub struct MouseState {
    pub x: i32,
    pub y: i32,
    pub last_update: Option<Instant>,
}

// AppState 应该包含 Arc<Mutex<...>> 来实现线程间的安全共享
pub struct AppState {
    pub is_picking: Arc<Mutex<bool>>,
    pub mouse_state: Arc<Mutex<MouseState>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            is_picking: Arc::new(Mutex::new(false)),
            mouse_state: Arc::new(Mutex::new(MouseState::default())),
        }
    }
}
#[tauri::command]
pub async fn get_mouse_position(state: State<'_, AppState>) -> Result<(i32, i32), String> {
    let mouse_state = state.mouse_state.lock().map_err(|e| e.to_string())?;
    Ok((mouse_state.x, mouse_state.y))
}

// #[tauri::command]
// async fn get_color_at_position(x: i32, y: i32) -> Result<(u8, u8, u8), String> {
//     if x < 0 || y < 0 {
//         return Err("Invalid coordinates".to_string());
//     }

//     let screens = Screen::all().map_err(|e| e.to_string())?;

//     for screen in screens {
//         let screen_x = screen.display_info.x;
//         let screen_y = screen.display_info.y;
//         let screen_width = screen.display_info.width as i32;
//         let screen_height = screen.display_info.height as i32;

//         if x >= screen_x
//             && x <= screen_x + screen_width
//             && y >= screen_y
//             && y <= screen_y + screen_height
//         {
//             let rel_x = (x - screen_x) as i32;
//             let rel_y = (y - screen_y) as i32;

//             if rel_x >= 0 && rel_y >= 0 && rel_x < screen_width && rel_y < screen_height {
//                 match screen.capture_area(rel_x, rel_y, 1, 1) {
//                     Ok(capture) => {
//                         // 修正：使用正确的 API 获取像素数据
//                         // screenshots 库新版本使用 pixels() 方法
//                         let pixels = capture.pixels();

//                         // 确保有像素数据
//                         if !pixels.is_empty() {
//                             // 像素格式通常是 RGBA 或 BGRA，取决于平台
//                             // 通常格式是 [R, G, B, A] 或 [B, G, R, A]
//                             let pixel = &pixels[0];

//                             // 假设是 RGBA 格式
//                             if pixel.len() >= 3 {
//                                 return Ok((pixel[0], pixel[1], pixel[2]));
//                             }
//                         }
//                     }
//                     Err(e) => {
//                         eprintln!("截图失败: {}", e);
//                         continue;
//                     }
//                 }
//             }
//         }
//     }

//     Err("无法在指定位置获取颜色".to_string())
// }

#[tauri::command]
pub async fn start_color_picking(state: State<'_, AppState>) -> Result<(), String> {
    let mut is_picking = state.is_picking.lock().map_err(|e| e.to_string())?;
    *is_picking = true;
    Ok(())
}

#[tauri::command]
pub async fn stop_color_picking(state: State<'_, AppState>) -> Result<(), String> {
    let mut is_picking = state.is_picking.lock().map_err(|e| e.to_string())?;
    *is_picking = false;
    Ok(())
}
