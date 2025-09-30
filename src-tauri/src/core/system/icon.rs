// use tauri::{command, AppHandle, Manager};

// pub fn change_window_icon_api(
//     window_label: String,
//     icon_name: String,
//     app: AppHandle,
// ) -> Result<(), String> {
//     // 使用 app.get_window(&window_label) 来获取特定窗口的句柄
//     if let Some(window) = app.get_window(&window_label) {
//         // 构建图标文件的路径。Tauri 会在打包时处理好资源路径。
//         let icon_path = format!("icons/{}", icon_name);

//         // 使用 tauri::Icon::File 来加载图标
//         match tauri::Icon::File(icon_path.into()) {
//             Ok(icon) => {
//                 // 设置窗口图标
//                 if let Err(e) = window.set_icon(icon) {
//                     return Err(format!("Failed to set icon: {}", e));
//                 }
//                 Ok(())
//             }
//             Err(e) => Err(format!("Failed to load icon file: {}", e)),
//         }
//     } else {
//         Err(format!("Window with label '{}' not found", window_label))
//     }
// }
