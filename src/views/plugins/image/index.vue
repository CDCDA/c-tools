<template>
  <div class="image-container">
    <img :src="imageUrl" alt="截图" data-tauri-drag-region />
    <el-icon class="close-btn" @click="close()">
      <Close />
    </el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Close } from "@element-plus/icons-vue";
import { close } from "@/utils/window.ts";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
const eventBusStore = useEventBusStore();
const imageUrl = ref("");
onMounted(async () => {
  const imageData = eventBusStore.get("image")?.imageData;
  console.log("imageData:", imageData);
  if (!imageData) {
    close();
    return;
  }
  imageUrl.value = imageData;
});
</script>

<style lang="scss" scoped>
.image-container {
  &:hover {
    .close-btn {
      visibility: visible !important;
    }
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    color: white;
    z-index: 999;
    transition: visibility 0.3s ease-in-out;
    &:before {
      content: "";
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      background: rgba(85, 85, 85, 0.7);
      z-index: -1;
      border-radius: 50%;
      left: -2px;
      top: -2px;
      position: absolute;
    }
    visibility: hidden;
  }
}
</style>
