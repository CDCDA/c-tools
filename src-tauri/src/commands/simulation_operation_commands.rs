use crate::core::simulation_operation::keyboard::handle_paste;
// 模拟粘贴
#[tauri::command]
pub async fn paste(text: &str) -> Result<(), String> {
    handle_paste(text);
    Ok(())
}
