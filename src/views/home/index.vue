<template>
  <div
    class="home-container"
    v-show="settingStore.visible"
    :style="{ height: mode == 'search' ? 'fit-content' : '100vh' }"
  >
    <SearchBar @pluginSearch="handleSearch" v-if="mode == 'search'" @changeMode="changeMode" />
    <PluginBar
      v-if="mode == 'plugin' && selectPlugin.showHeader"
      :plugin="selectPlugin"
      @pluginSearch="pluginSearch"
      @pluginClose="pluginClose"
    />
    <PluginList ref="pluginListRef" v-if="mode == 'search'" @pluginShow="pluginShow" />
    <main class="content-container" v-if="mode !== 'search'">
      <div class="component-container" v-if="mode == 'plugin'">
        <transition name="fade" mode="out-in">
          <component ref="pluginRef" class="application" :is="component" @pluginClose="pluginClose" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import PluginList from "@/views/plugins/pluginList.vue";
import PluginBar from "@/layout/headerBar/pluginBar.vue";
import Windows from "@/windows/index.js";
import { getPluginByKey } from "../plugins/plugins.ts";
import SearchBar from "@/layout/headerBar/searchBar.vue";
import { setWindowSize, adjustWindowSize } from "@/utils/window.ts";
import { ref, onMounted, watch } from "vue";
import { useSettingStore } from "@/store/modules/setting.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
import { useRouter } from "vue-router";

const eventBusStore = useEventBusStore();
const router = useRouter();
const currentWindow = getCurrentWindow();
const settingStore = useSettingStore();
// search:查找插件,plugin:运行子插件,setting:管理插件,
const mode = ref("search");
const pluginListRef = ref(null) as any;

const pluginRef = ref(null) as any;
const component = ref(null) as any;
const selectPlugin = ref({}) as any;

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    console.log("新路由", newRoute);
    if (newRoute.query.pluginKey) {
      pluginShow(getPluginByKey(newRoute.query.pluginKey));
    }
  },
  {
    deep: true,
  }
);

watch(
  () => eventBusStore.getCurrentPlugin(),
  (newPlugin: any) => {
    console.log("当前插件", newPlugin);
    if (newPlugin) {
      pluginShow(newPlugin);
    }
  }
);

const pluginShow = async (plugin: any) => {
  if (plugin.newWindow) {
    selectPlugin.value = null;
    component.value = null;
    mode.value = "search";
    await createNewWindow(plugin);
    currentWindow.hide();
  } else {
    selectPlugin.value = plugin;
    mode.value = "plugin";
    await currentWindow.show();
    component.value = plugin.component;
    settingStore.transparent = plugin.transparent;

    if (plugin.fullscreen) {
      await currentWindow.setFullscreen(true);
    } else {
      await setWindowSize();
    }

    plugin.setAlwaysOnTop ? await currentWindow.setAlwaysOnTop(true) : null;
  }
};

function pluginSearch(query: string) {
  pluginRef.value?.handleSearch(query);
}

function handleSearch(query: string) {
  pluginListRef.value?.handleSearch(query);
}

const changeMode = (newMode: string) => {
  mode.value = newMode;
};

const pluginClose = async (hidden?: boolean) => {
  mode.value = "search";
  component.value = null;
  initWindow();
  if (hidden) {
    await currentWindow.hide();
  }
};

async function createNewWindow(plugin: any) {
  const newWindow = new Windows();
  const win = await newWindow.createWin(
    {
      label: `tool-${plugin.key}`,
      title: plugin.name,
      transparent: plugin.transparent,
      fullscreen: plugin.fullscreen, // 窗口是否全屏
      decorations: false, // 窗口是否装饰边框及导航条
      alwaysOnTop: plugin.alwaysOnTop, // 置顶窗口
      skipTaskbar: true, // 窗口是否从任务栏中排除
    },
    {
      routeName: plugin.key,
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
}

async function initWindow() {
  settingStore.transparent = false;
  await currentWindow.setFullscreen(false);
  await setWindowSize(800, 255);
  await currentWindow.setAlwaysOnTop(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.style.borderRadius = "8px";
  }
  currentWindow.emit("theme-changed");
  await adjustWindowSize();
}

onMounted(() => {
  initWindow();
});
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.content-container {
  flex: 1;
  overflow: auto;
}
.component-container {
  height: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
