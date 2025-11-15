use crate::core::system::sys_info::{get_dynamic_system_info, DynamicSystemInfo};
// 获取系统信息
#[tauri::command]
pub async fn get_system_info() -> DynamicSystemInfo {
    get_dynamic_system_info().await
}

#[tauri::command]
pub async fn set_app_fullscreen(window: tauri::Window, fullscreen: bool) -> Result<(), String> {
    // 使用 await 是因为 set_fullscreen 是异步操作
    window
        .set_fullscreen(fullscreen)
        .map_err(|e| format!("无法设置全屏状态: {}", e))
}
