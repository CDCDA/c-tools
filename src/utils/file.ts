import {
  open as openDialog,
  save as saveDialog,
  type OpenDialogOptions,
  type SaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

async function list(options: any) {
  const files = await invoke("list_directory_recursively_jwalk", options);
  return files;
}

async function read(filePath: any) {
  return await invoke("read_file", { filePath });
}

async function write(filePath: any, content: any) {
  await invoke("write_file", { filePath, content });
}

async function move(filePath: any, newFilePath: any) {
  await invoke("move_file", { filePath, newFilePath });
}

async function remove(filePath: any) {
  await invoke("remove_file", { filePath });
}

async function openFolder(filePath: any) {
  console.log("openFolder", filePath);
  // 核心修改：左边的 key 必须写成 'file_path'，对应 Rust 的参数名
  await invoke("open_folder", { filePath });
}

/**
 * 打开一个文件选择对话框，让用户选择一个或多个文件。
 * @param options - 对话框配置选项。
 * @returns {Promise<string | string[] | null>} 用户选择的文件路径，如果取消则返回 null。
 */
async function openFileDialog(options?: OpenDialogOptions): Promise<string | string[] | null> {
  try {
    return await openDialog(options);
  } catch (error: any) {
    console.error("打开文件夹弹窗失败:", error);
    return null;
  }
}
/**
 * 打开一个文件保存对话框，让用户选择保存位置。
 * @param options - 对话框配置选项。
 * @returns {Promise<string | null>} 用户选择的保存路径，如果取消则返回 null。
 */
async function saveFileDialog(options?: SaveDialogOptions): Promise<string | null> {
  try {
    return await saveDialog(options);
  } catch (error: any) {
    console.error("打开保存文件弹窗失败:", error);
    return null;
  }
}

export { openFileDialog, saveFileDialog, list, read, write, move, remove, openFolder };
