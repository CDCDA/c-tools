import { getCurrentWindow } from "@tauri-apps/api/window";
import { getScreenSize } from "@/utils/window.ts";
/**
 * 创建通知窗口
 * @param params
 * @param params.title 通知标题
 * @param params.content 通知内容
 * @param params.x 窗口横坐标
 * @param params.y 窗口纵坐标
 * @param params.width 窗口宽度
 * @param params.height 窗口高度
 */
export async function createNotificationWindow(params: any) {
  const currentWindow = getCurrentWindow();
  const screenSize = await getScreenSize();
  // console.log("screenSize:", screenSize);
  await currentWindow.emit(`create-window`, {
    windowData: {
      label: `tool-notification-${Date.now()}`,
      title: "通知",
      transparent: true,
      fullscreen: false, // 窗口是否全屏
      decorations: false, // 窗口是否装饰边框及导航条
      alwaysOnTop: true, // 置顶窗口
      skipTaskbar: true, // 窗口是否从任务栏中排除
      visible: false,
      x: params.x || screenSize.width - 390,
      y: params.y || screenSize.height - 160,
      width: params.width || 365,
      height: params.height || 100,
    },
    params: {
      routeName: "notification",
      transparent: true,
      showHeader: false,
      duration: params.duration || 5 * 1000,

      notificationData: {
        title: params.title,
        content: params.content,
      },
    },
  });
}
