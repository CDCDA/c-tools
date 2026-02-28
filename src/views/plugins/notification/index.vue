<template>
  <div class="notification-container">
    <div class="notification-header" data-tauri-drag-region>
      <div class="notification-title" data-tauri-drag-region>{{ notificationData.title }}</div>
      <el-icon class="close-btn" @click="close()">
        <Close />
      </el-icon>
    </div>
    <div class="notification-content">
      {{ notificationData.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Close } from "@element-plus/icons-vue";
import { close } from "@/utils/window.ts";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
const eventBusStore = useEventBusStore();
const notificationData = ref("");
onMounted(async () => {
  notificationData.value = eventBusStore.get("notification")?.notificationData;
  console.log("notificationData:", notificationData.value);
  if (!notificationData.value) {
    close();
    return;
  }
});
</script>

<style lang="scss" scoped>
.notification-container {
  display: flex;
  flex-direction: column;
  // position: absolute;
  height: 100%;
  width: 100%;
  background: #252526;
  // animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  .notification-header {
    padding: 3px 10px;
    z-index: 999;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
    font-weight: bold;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .notification-content {
    padding: 5px 10px;
    font-size: 14px;
  }
  .close-btn {
    cursor: pointer;

    z-index: 999;
  }
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
