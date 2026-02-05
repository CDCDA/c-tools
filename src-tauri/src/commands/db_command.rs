// 在Tauri的命令处理文件中
use crate::core::database::db_api::{ColumnInfo, DbMetadataService, TableInfo};

#[tauri::command]
pub async fn test_db_connection(connection_string: String) -> Result<String, String> {
    DbMetadataService::test_connection(connection_string).await
}

#[tauri::command]
pub async fn get_all_tables(connection_string: String) -> Result<Vec<TableInfo>, String> {
    DbMetadataService::get_all_tables_api(connection_string).await
}

#[tauri::command]
pub async fn get_table_columns(
    connection_string: String,
    schema: String,
    table_name: String,
) -> Result<Vec<ColumnInfo>, String> {
    DbMetadataService::get_table_columns_api(connection_string, schema, table_name).await
}
