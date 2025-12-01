<template>
  <div class="screenshot-container">
    <!-- 截图遮罩层 -->
    <div
      v-if="isCapturing"
      class="capture-overlay"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="endSelection"
    >
      <!-- 选择区域框 -->
      <div
        v-if="selection.active"
        class="selection-box"
        :style="{
          left: selection.x + 'px',
          top: selection.y + 'px',
          width: selection.width + 'px',
          height: selection.height + 'px',
        }"
      >
        <!-- 尺寸显示 -->
        <div class="size-indicator">{{ selection.width }} × {{ selection.height }}</div>
      </div>

      <!-- 坐标显示 -->
      <div class="coordinate-display">坐标: ({{ currentMouse.x }}, {{ currentMouse.y }})</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const currentWindow = getCurrentWindow();
const emit = defineEmits(["pluginClose"]);

// 响应式数据
const isCapturing = ref(false);
const capturedImage = ref("");
const selection = ref({
  active: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});
const currentMouse = ref({ x: 0, y: 0 });

// 开始截图
const startCapture = () => {
  isCapturing.value = true;
  selection.value.active = false;
  document.body.style.overflow = "hidden";
};

// 开始选择区域
const startSelection = (event) => {
  selection.value.active = true;
  selection.value.startX = event.clientX;
  selection.value.startY = event.clientY;
  selection.value.x = event.clientX;
  selection.value.y = event.clientY;
  selection.value.width = 0;
  selection.value.height = 0;
};

// 更新选择区域
const updateSelection = (event) => {
  currentMouse.value.x = event.clientX;
  currentMouse.value.y = event.clientY;

  if (selection.value.active) {
    const { startX, startY } = selection.value;
    selection.value.x = Math.min(startX, event.clientX);
    selection.value.y = Math.min(startY, event.clientY);
    selection.value.width = Math.abs(event.clientX - startX);
    selection.value.height = Math.abs(event.clientY - startY);
  }
};

// 结束选择并截图
const endSelection = async () => {
  if (!selection.value.active || selection.value.width < 5 || selection.value.height < 5) {
    selection.value.active = false;
    return;
  }

  try {
    const area = {
      x: Math.round(selection.value.x) + 2,
      y: Math.round(selection.value.y) + 2,
      width: Math.round(selection.value.width),
      height: Math.round(selection.value.height),
    };

    // 调用 Rust 后端截图
    const result = await invoke("capture_area", area);
    if (result) {
      capturedImage.value = result;
    }
    await copyToClipboard();
    currentWindow.close();
  } catch (error) {
    console.error("截图错误:", error);
  } finally {
    cleanup();
  }
};

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const response = await fetch(capturedImage.value);
    const blob = await response.blob();
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error("复制失败:", error);
  }
};

// 清理资源
const cleanup = () => {
  isCapturing.value = false;
  document.body.style.overflow = "";
  emit("pluginClose", true);
};

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === "Escape" && isCapturing.value) {
    cleanup();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  startCapture();
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.screenshot-container {
  padding: 0;
}

/* 截图遮罩层 */
.capture-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  cursor: crosshair;
  z-index: 9999;
}

/* 选择区域框 */
.selection-box {
  position: absolute;
  border: 2px solid #007acc;
  background: transparent;
  pointer-events: none;
}

.size-indicator {
  position: absolute;
  top: -30px;
  left: 0;
  background: #007acc;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.coordinate-display {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: monospace;
}
</style>
