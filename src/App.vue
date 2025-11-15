<template>
  <div class="app-container" :style="{ background: settingStore.transparent ? 'transparent' : 'white' }">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import { adjustWindowSize, setWindowSize } from "@/utils/window.ts";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useRouter } from "vue-router";
import { useSettingStore } from "@/store/modules/setting";
const settingStore = useSettingStore();
// import { readData } from "@/utils/dataSave";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
// import { listen } from "@tauri-apps/api/event";
const router = useRouter();
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
const initRegister = async () => {
  try {
    await unregister("CommandOrControl+B");
  } finally {
    await register("CommandOrControl+B", () => {
      currentWindow.hide();
    });
  }
  try {
    await unregister("CommandOrControl+1");
  } finally {
    await register("CommandOrControl+1", () => {
      currentWindow.show();
      currentWindow.setFocus();
    });
  }
};
// initRegister();
if (currentWindow.label == "main") {
  router.push({ name: "home" });
} else {
  adjustWindowSize(0, 0);
  settingStore.transparent = true;

  router.push({ name: currentWindow.label, query: { key: currentWindow.label } });
}

function init() {
  nextTick(() => {
    adjustWindowSize();
  });
}

onMounted(() => {
  init();
});
// listen("tauri://blur", () => {
//   setTimeout(() => {
//     currentWindow.hide();
//   }, 500);
// });
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
}
body {
  overflow: hidden;
  margin: 0;
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}
</style>
