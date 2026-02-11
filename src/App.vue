<template>
  <div class="app-container" :style="{ background: settingStore.transparent ? 'transparent' : 'white !important' }">
    <RouterView />
    <GlobalParamModal />

  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount } from "vue";
import { adjustWindowSize } from "@/utils/window.ts";
import { useRouter } from "vue-router";
import { quickTranslate } from "@/api/translation.ts";
import { saveAllStore, loadAllStore } from "@/utils/storeManage.ts";
import { listen } from "@tauri-apps/api/event";
import { useSettingStore } from "@/store/modules/setting.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
import Windows from "@/windows/index.js";
import { createNotificationWindow } from "@/utils/notification.ts";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import GlobalParamModal from '@/components/globalParamModal/index.vue';

import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
const eventBusStore = useEventBusStore();

const settingStore = useSettingStore();
const router = useRouter();
const currentWindow = getCurrentWindow();

async function setupWindow() {
  console.log('当前窗口', currentWindow)
  if (currentWindow.label === "main") {
    settingStore.transparent = false;
    // 初始化所有store(包括快捷键)
    router.push({ name: "pluginSearch" });
    loadAllStore(true);

    // 监听创建窗口事件
    await listen(`create-window`, async (event: any) => {
      const newWindow = new Windows();
      const { windowData, params } = event.payload;
      const win = await newWindow.createWin(windowData, params);
      console.log("params:", params);
      if (params.duration) {
        setTimeout(() => {
          win.close();
        }, params.duration);
      }
    });
    return;
  }
  if (currentWindow.label === "tool-screenshot") {
    settingStore.transparent = true;
    router.push({ name: "screenshot" })
    return
  }
  // 不初始化快捷键（其他窗口）
  loadAllStore(false);
  await listen(`init-data-${currentWindow.label}`, (event: any) => {
    console.log("【成功】接收到的参数:", event.payload);
    const params = event.payload;
    if (params.transparent) {
      settingStore.transparent = true;
    } else {
      settingStore.transparent = false;
    }
    if (params.showHeader) {
      settingStore.showHeader = true;
    } else {
      settingStore.showHeader = false;
    }
    router.push({ name: params.routeName, query: { routeName: params.routeName } });
    switch (params.routeName) {
      case "notification":
        eventBusStore.set("notification", params);
        break;
      case "image":
        eventBusStore.set("image", params);
        break;
      case "screenshot":
        eventBusStore.set("fullScreenImage", params.fullScreenImage);
        break;
      case "screenshotAndSuspended":
        eventBusStore.set("fullScreenImage", params.fullScreenImage);
        break;
    }
    currentWindow.show()
  });

  await currentWindow.emit(`window-ready-${currentWindow.label}`);
}

function init() {
  // enable()
  setupWindow();
  nextTick(() => {
    adjustWindowSize();
  });
}
init();
onMounted(async () => {
  console.log("测试翻译...");
  const res = await quickTranslate("测试文本");
  console.log("测试结果:", res);
})

onBeforeUnmount(() => {
  // console.log("【成功】关闭窗口:", currentWindow.label);
  saveAllStore();
});
</script>

<style>
:root {
  --el-color-primary: #00968c !important;
  --el-color-danger: #f76d6b !important;
  --el-color-info: #94929c !important;
  --el-color-warning: #e6a23c !important;
  --el-color-success: #63c339 !important;
  --el-color-primary-light-3: #4db6ac !important;
  --el-button-active-bg-color: #00968c !important;
  --el-button-hover-bg-color: #00968c !important;
  /* --el-table-border-color: #d5d7dd !important;
  --el-border-color-lighter: #d5d7dd !important; */
}

body {
  overflow: hidden;
  margin: 0;
  transition: all 0.4s ease-in-out;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: transparent !important;
}
</style>
