import { register, unregister, isRegistered } from "@tauri-apps/plugin-global-shortcut";

const keyMap = {
  Ctrl: "Control",
  Alt: "Alt",
  Shift: "Shift",
  Meta: "Meta",
} as any;

export const registerShortcut = async (item: any) => {
  if (!item.shortcut) return;

  try {
    const shortcutKey = item.shortcut.replace(/Ctrl|Alt|Shift|Meta/g, (match: any) => keyMap[match]);

    // 检查快捷键是否已被注册
    const isKeyRegistered = await isRegistered(shortcutKey);
    if (isKeyRegistered) {
      console.log(`快捷键 ${item.shortcut} 已被注册，将先注销再重新注册`);
      await unregister(shortcutKey);
    }

    // 关键修复点：增加回调函数的状态判断
    await register(shortcutKey, (event) => {
      // event.state 有两个值: 'Pressed' 和 'Released'
      if (event.state === "Pressed") {
        console.log(`快捷键触发 (Pressed): ${item.shortcut}`);
        item.event();
      }
    });

    return true;
  } catch (error) {
    // console.error(`注册快捷键 ${item.shortcut} 时出错:`, error);
    return false;
  }
};

export const unRegisterShortcut = async (item: any) => {
  if (!item.shortcut) return;
  try {
    const shortcutKey = item.shortcut.replace(/Ctrl|Alt|Shift|Meta/g, (match: any) => keyMap[match]);
    const isKeyRegistered = await isRegistered(shortcutKey);
    if (isKeyRegistered) {
      await unregister(shortcutKey);
    }
  } catch (error) {
    console.error(`注销快捷键 ${item.shortcut} 时出错:`, error);
    return false;
  }
};
