import { routes } from "@/router/index.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { setWindowSize } from "@/utils/window.ts";
import Windows from "@/windows/index.js";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
import { Image } from "@tauri-apps/api/image";
const currentWindow = getCurrentWindow();
// 工具插件
export const pluginData = getPluginData().filter((item) => item.type === "tool");
// 辅助插件
export const assistPlugins = getPluginData().filter((item) => item.type === "assist");

export function getPluginData() {
  const pluginRoute = routes.find((route: any) => route.name === "plugin");
  if (!pluginRoute) return [];
  const pluginData: any[] = [];
  for (const route of pluginRoute.children) {
    const item = {
      ...route,
      ...route.meta,
    };
    pluginData.push(item);
  }
  return pluginData;
}

export const getPluginByName = (name: string) => {
  const plugin = getPluginData().find((item) => {
    return item.name === name;
  });
  return plugin;
};

// 选择插件并执行
export const selectPlugin = async (plugin: any, router: any) => {
  plugin = getPluginByName(plugin.name);
  const eventBusStore = useEventBusStore();
  eventBusStore.currentPlugin = plugin;
  console.log("选择插件", plugin);

  if (plugin.newWindow) {
    createNewWindow(plugin, router);
  } else {
    setWindowSize(800, 25);
    await router.push({
      name: plugin.name,
      query: {
        type: "main",
      },
    });
    setWindowSize(plugin.width, plugin.height);
    eventBusStore.pluginLoading = false;
    currentWindow.show();
    currentWindow.setFocus();
  }
};

export async function createNewWindow(plugin: any, router: any) {
  setWindowSize(800, 220);
  router.push({ name: "pluginSearch" });
  const newWindow = new Windows();
  console.log("创建新窗口参数:", plugin);
  const win = await newWindow.createWin(
    {
      label: `tool-${plugin.label}`,
      title: plugin.label,
      transparent: plugin.transparent,
      fullscreen: plugin.fullscreen, // 窗口是否全屏
      decorations: false, // 窗口是否装饰边框及导航条
      alwaysOnTop: plugin.alwaysOnTop, // 置顶窗口
      skipTaskbar: plugin.skipTaskbar, // 窗口是否从任务栏中排除
      width: plugin.width,
      height: plugin.height,
    },
    {
      routeName: plugin.name,
      minimize: false,
      transparent: plugin.transparent,
      showHeader: plugin.showHeader,
    }
  );
  win.once("tauri://created", async () => {
    if (!plugin.ico) {
      return;
    }
    try {
      const image = await (Image as any).fromPath(plugin.ico);
      await win.setIcon(image);
    } catch (error: any) {
      console.error("设置图标失败:", error);
    }
  });
  currentWindow.hide();
}
