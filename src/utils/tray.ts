import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { defaultWindowIcon } from "@tauri-apps/api/app";

// 单例变量用于存储托盘实例
let trayInstance: TrayIcon | null = null;

/**
 * 初始化系统托盘
 */
export async function tray_init() {
  if (trayInstance) {
    return;
  }

  const menu = await Menu.new({
    items: [
      {
        id: "info",
        text: "关于",
        action: () => console.log("关于软件"),
      },
      {
        id: "quit",
        text: "退出",
        action: async () => await getCurrentWindow().close(),
      },
    ],
  });

  const options = {
    icon: await defaultWindowIcon(),
    menu,
    menuOnLeftClick: false,
    action: async (event: any) => {
      if (event.type === "Click" && event.button === "Left") {
        const appWindow = getCurrentWindow();
        await appWindow.unminimize();
        await appWindow.show();
        await appWindow.setFocus();
      }
    },
  };
  trayInstance = await TrayIcon.new(options as any);
  // 调用修改函数
  // changeTrayIcon("32x32.png");
}

/**
 * 动态修改托盘图标
 * @param iconName - 在 `icons` 目录下的图标文件名
 */
export async function changeTrayIcon(iconName: string) {
  if (!trayInstance) {
    console.warn("未初始化托盘");
    return;
  }
  try {
    const newIconPath = `icons/${iconName}`;
    await trayInstance.setIcon(newIconPath);
    console.log(`Tray icon changed to ${iconName}`);
  } catch (error) {
    console.error("Failed to change tray icon:", error);
  }
}

export default tray_init;
