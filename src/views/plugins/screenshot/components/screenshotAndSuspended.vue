<template>
  <!-- 容器背景是全屏截图 -->
  <div class="screenshot-container" :style="{ backgroundImage: `url(${fullScreenImage})` }">
    <!-- 截图遮罩层 -->
    <div v-if="isCapturing" class="capture-overlay" :class="{ 'is-selecting': selection.active }"
      @mousedown="startSelection" @mousemove="updateSelection" @mouseup="endSelection">
      <!-- 初始未拖拽时的全局灰色遮罩（可选，见下方 CSS） -->
      <div v-if="!selection.active" class="full-mask"></div>
      <!-- 选择区域框 -->
      <div v-show="selection.active" class="selection-box" :style="{
        left: selection.x + 'px',
        top: selection.y + 'px',
        width: selection.width + 'px',
        height: selection.height + 'px',
      }">
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
import { ElNotification } from "element-plus";
import { convertFileSrc } from '@tauri-apps/api/core';
const props = defineProps({
  type: {
    type: String,
    default: 'screenshot',
  },
  fullScreenImage: {
    type: String,
    default: '',
  },
})

const currentWindow = getCurrentWindow();

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
  currentWindow.show()
  currentWindow.setFocus()
};
// 开始选择区域
const startSelection = (event) => {
  selection.value.active = true; // 立即激活
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
      ignoreDpi: false,
    };
    isCapturing.value = false;
    // 调用 Rust 后端截图
    const result = await invoke("capture_area", area);
    if (result) {
      capturedImage.value = result;
    }
    await copyToClipboard();
    await createNewImageWindow(area);
    cleanup();
  } catch (error) {
    console.error("截图错误:", error);
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

async function createNewImageWindow(area) {
  await currentWindow.emit(`create-window`, {
    windowData: {
      label: `tool-image-${Date.now()}`,
      title: "截图结果",
      transparent: true,
      fullscreen: false, // 窗口是否全屏
      decorations: false, // 窗口是否装饰边框及导航条
      alwaysOnTop: true, // 置顶窗口
      skipTaskbar: true, // 窗口是否从任务栏中排除
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
    },
    params: {
      routeName: "image",
      transparent: true,
      showHeader: false,
      imageData: capturedImage.value,
    },
  });
}

// 清理资源
const cleanup = () => {
  isCapturing.value = false;
  document.removeEventListener("keydown", handleKeyDown);
  currentWindow.hide();
};

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === "Escape" && isCapturing.value) {
    cleanup();
  }
};


defineExpose({
  start() {
    document.addEventListener("keydown", handleKeyDown);
    startCapture();
  },
})
</script>

<style scoped>
.screenshot-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden;
}

/* 截图遮罩容器：不设背景色，由内部元素控制 */
.capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  cursor: crosshair;
}

/* 初始状态：全屏半透明灰色 */
.full-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  /* 调整遮罩透明度 */
}

/* 选择区域框 */
.selection-box {
  position: absolute;
  border: 2px solid white;
  /* 蓝色边框 */
  background: transparent;
  /* 内部透明，露出底层图片 */
  pointer-events: none;
  /* 让鼠标事件穿透到父层 overlay */

  /* 核心：利用巨大的 box-shadow 实现四周遮罩 */
  /* 这里的 9999px 确保阴影覆盖整个屏幕 */
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

.size-indicator {
  position: absolute;
  top: -25px;
  left: 0;
  background: #007acc;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.coordinate-display {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  pointer-events: none;
}
</style>
