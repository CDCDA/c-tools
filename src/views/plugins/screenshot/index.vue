<template>
  <div class="screenshot-container">
    <ColorExtraction v-if="type === 'colorExtraction'" :type="type" ref="itemRef" :fullScreenImage="fullScreenImage" />
    <Screenshot v-if="type === 'screenshot'" :type="type" :fullScreenImage="fullScreenImage" ref="itemRef" />
    <ScreenshotAndSuspended v-if="type === 'screenshotAndSuspended'" ref="itemRef" :type="type"
      :fullScreenImage="fullScreenImage" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { listen } from "@tauri-apps/api/event";
import ColorExtraction from "./components/colorExtraction.vue"
import Screenshot from "./components/screenshot.vue"
import ScreenshotAndSuspended from "./components/screenshotAndSuspended.vue"
import { getCurrentWindow, getAllWindows } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();

const type = ref('')
const fullScreenImage = ref('')
const itemRef = ref(null) as any
listen(`init-screenshot`, async (event: any) => {
  type.value = event.payload[0]
  fullScreenImage.value = event.payload[1]
  console.log(type.value)
  currentWindow.show()
  currentWindow.setFocus()
  currentWindow.unminimize()
  setTimeout(() => {
    console.log("111", itemRef.value)
    itemRef.value?.start()
  }, 0)
});

</script>
<style scoped>
.screenshot-container {
  height: 100vh;
  background: transparent;
}
</style>
