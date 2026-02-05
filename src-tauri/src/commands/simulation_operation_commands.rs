use crate::core::simulation_operation::keyboard::handle_paste;
use crate::core::simulation_operation::shortcut::handle_shortcut;
use tauri::AppHandle;

// 模拟粘贴
#[tauri::command]
pub async fn paste(text: &str) -> Result<(), String> {
    handle_paste(text);
    Ok(())
}

#[tauri::command]
pub async fn shortcut(app: AppHandle, route_path: &str) -> Result<(), String> {
    handle_shortcut(app, route_path);
    Ok(())
}
