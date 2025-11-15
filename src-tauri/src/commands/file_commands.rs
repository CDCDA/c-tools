use crate::core::file::file_api::{
    list_directory_recursive_jwalk, move_file_api, read, remove, write, FileNode,
};
use crate::core::file::file_hash::{calculate_hashes, HashResult};
use anyhow::Result;
use std::path::PathBuf;

// 遍历目录递归获取所有文件路径
// #[tauri::command]
// pub async fn list_directory_recursively(
//     path: String,
//     exclude_files: String,
//     max_depth: usize,
// ) -> Result<Vec<FileNode>, String> {
//     list_directory_recursive(path, exclude_files, max_depth).map_err(|e| e.to_string())
// }

// 遍历目录递归获取所有文件路径-并行
#[tauri::command]
pub async fn list_directory_recursively_jwalk(
    path: String,
    exclude_files: String,
    include_files: String,
    max_depth: usize,
) -> Result<Vec<FileNode>, String> {
    list_directory_recursive_jwalk(path, exclude_files, include_files, max_depth)
        .map_err(|e| e.to_string())
}

// 计算文件哈希值
#[tauri::command]
pub async fn calculate_file_hash(path: PathBuf) -> Result<HashResult, String> {
    calculate_hashes(path).await.map_err(|e| e.to_string())
}

// 读取文件内容
#[tauri::command]
pub fn read_file(file_path: String) -> Result<String, String> {
    read(file_path).map_err(|e| e.to_string())
}

// 删除文件
#[tauri::command]
pub fn remove_file(file_path: String) -> Result<(), String> {
    remove(file_path).map_err(|e| e.to_string())
}

// 写入文件内容
#[tauri::command]
pub fn write_file(file_path: String, content: String) -> Result<(), String> {
    write(file_path, content).map_err(|e| e.to_string())
}

// 移动文件
#[tauri::command]
pub fn move_file(file_path: String, new_file_path: String) -> Result<(), String> {
    move_file_api(file_path, new_file_path).map_err(|e| e.to_string())
}
