import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

const keyMap = {
  Ctrl: "Control",
  Alt: "Alt",
  Shift: "Shift",
  Meta: "Meta",
} as any;

export const registerShortcut = async (item: any) => {
  try {
    await unRegisterShortcut(item);
    await register(
      item.shortcut.replace(/Ctrl|Alt|Shift|Meta/g, (match: any) => keyMap[match]),
      item.event
    );
  } catch (error) {
    console.error(`注册快捷键 ${item.shortcut} 时出错:`, error);
    return false;
  }
};

export const unRegisterShortcut = async (item: any) => {
  try {
    await unregister(item.shortcut.replace(/Ctrl|Alt|Shift|Meta/g, (match: any) => keyMap[match]));
  } catch (error) {
    console.error(`注销快捷键 ${item.shortcut} 时出错:`, error);
    return false;
  }
};
