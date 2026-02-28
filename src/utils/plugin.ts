import { routes } from "@/router/index.ts";
import { getCurrentWindow, getAllWindows } from "@tauri-apps/api/window";
import { setWindowSize } from "@/utils/window.ts";
import { invoke } from "@tauri-apps/api/core";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
import { usePluginConfigStore } from "@/store/modules/pluginConfig.ts";
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

  if (plugin) {
    const pluginConfigStore = usePluginConfigStore();
    const pluginConfig = pluginConfigStore.getPluginConfig(plugin.id || plugin.name);
    if (!pluginConfig) return plugin;
    console.log("插件配置", pluginConfig);
    return {
      ...plugin,
      ...pluginConfig.settings,
    };
  }

  return plugin;
};

const screenshotPlugins = ["screenshot", "screenshotAndSuspended", "colorExtraction"];

// 选择插件并执行
export const selectPlugin = async (plugin: any, router: any) => {
  console.log("选择插件11", plugin);
  const key = plugin?.name || plugin?.id;
  plugin = getPluginByName(key) as any;
  console.log("选择插件", plugin);

  if (!plugin) return;
  const eventBusStore = useEventBusStore();
  eventBusStore.currentPlugin = plugin;
  // 全屏截图相关插件
  if (screenshotPlugins.includes(key)) {
    console.log("全屏截图相关插件", await getAllWindows());
    await currentWindow.hide();
    await invoke("shortcut", { routePath: key });
    return;
  }
  eventBusStore.pluginLoading = true;
  setWindowSize(800, 35);
  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(null);
  //   }, 50000);
  // });
  // 新窗口插件
  if (plugin.newWindow) {
    await router.push({
      name: "pluginSearch",
    });
    await createNewWindow(plugin);
    setWindowSize(800, 220);
  } else {
    await router.push({
      name: plugin.name,
      query: {
        type: "main",
      },
    });
    setWindowSize(plugin.width, plugin.height);

    currentWindow.show();
    currentWindow.setFocus();
  }
};

export async function createNewWindow(plugin: any) {
  currentWindow.emit(`create-window`, {
    windowData: {
      label: `tool-${plugin.name}`,
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
