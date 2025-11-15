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

import SearchBar from "@/layout/headerBar/searchBar.vue";
import { setWindowSize, adjustWindowSize } from "@/utils/window.ts";
import { nextTick, ref, onMounted } from "vue";
import { useSettingStore } from "@/store/modules/setting";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
const settingStore = useSettingStore();
// search:查找插件,plugin:运行子插件,setting:管理插件,
const mode = ref("search");
const pluginListRef = ref(null) as any;

const pluginRef = ref(null) as any;
const component = ref(null) as any;
const selectPlugin = ref({}) as any;

const pluginShow = async (plugin: any) => {
  selectPlugin.value = plugin;
  if (plugin.newWindow) {
    currentWindow.hide();
    createNewWindow();
  } else {
    mode.value = "plugin";
    await currentWindow.show();
    component.value = plugin.component;
    settingStore.transparent = plugin.transparent;
    plugin.fullscreen ? await currentWindow.setFullscreen(true) : await setWindowSize();
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
  hidden ? currentWindow.hide() : null;
};

async function createNewWindow() {
  const newWindow = new Windows();
  const win = await newWindow.createWin({
    label: selectPlugin.value.key,
    title: selectPlugin.value.name,
    url: `/plugin/${selectPlugin.value.key}`,
    decorations: false,
    transparent: selectPlugin.value.transparent,
    fullscreen: false, // 窗口是否全屏
    decorations: false, // 窗口是否装饰边框及导航条
    alwaysOnTop: selectPlugin.value.alwaysOnTop, // 置顶窗口
    width: selectPlugin.value.width,
    height: selectPlugin.value.height,
  });
  win.once("tauri://created", async () => {
    try {
      const image = await Image.fromPath(selectPlugin.value.ico);
      await win.setIcon(image);
    } catch (error: any) {
      console.error("设置图标失败:", error);
    }
  });
}

onMounted(() => {
  setTimeout(() => {
    adjustWindowSize();
  }, 1000);
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
