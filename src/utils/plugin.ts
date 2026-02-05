import { routes } from "@/router/index.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { setWindowSize } from "@/utils/window.ts";
import { invoke } from "@tauri-apps/api/core";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
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

const screenshotPlugins = ["screenshot", "screenshotAndSuspended", "colorExtraction"];

// 选择插件并执行
export const selectPlugin = async (plugin: any, router: any) => {
  plugin = getPluginByName(plugin.name);
  const eventBusStore = useEventBusStore();
  eventBusStore.currentPlugin = plugin;
  eventBusStore.pluginLoading = true;
  // 全屏截图相关插件
  if (screenshotPlugins.includes(plugin.name)) {
    await invoke("shortcut", { routePath: "screenshot" });
    eventBusStore.pluginLoading = true;
    currentWindow.hide();

    return;
  }
  // 新窗口插件
  if (plugin.newWindow) {
    router.push({
      name: "pluginSearch",
    });
    createNewWindow(plugin);
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

export async function createNewWindow(plugin: any) {
  setWindowSize(800, 220);
  currentWindow.emit(`create-window`, {
    windowData: {
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
    params: {
      routeName: plugin.name,
      minimize: false,
      transparent: plugin.transparent,
      showHeader: plugin.showHeader,
      ico: plugin.ico,
    },
  });
  currentWindow.hide();
}
