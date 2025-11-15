<template>
  <div class="color-extraction">
    <!-- 像素级放大镜 -->
    <PixelPerfectMagnifier
      v-if="isPicking && fullScreenImage"
      :full-screen-image="fullScreenImage"
      :mouse-position="mousePosition"
      :magnification="12"
      :grid-size="9"
      :view-size="110"
      @pixel-change="onPixelChange"
      @color-picked="onColorPicked"
      ref="magnifierRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { listen } from "@tauri-apps/api/event";
import PixelPerfectMagnifier from "@/components/image/canvasMagnifier.vue";
const emit = defineEmits(["plugin-close"]);
interface RgbColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

// 响应式状态
const isPicking = ref(false);
const currentColor = ref<RgbColor | null>(null);
const fullScreenImage = ref("");
const mousePosition = ref({ x: 0, y: 0 });
const magnifierRef = ref();

const currentWindow = getCurrentWindow();
let cleanupFunctions: (() => void)[] = [];

const exitFullscreen = async () => {
  console.log("退出全屏");
  // 先退出全屏
  await currentWindow.setFullscreen(false);

  // 等待一帧让浏览器更新
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 重新设置圆角样式
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.style.borderRadius = "8px";
  }

  // 强制重绘
  currentWindow.emit("theme-changed");
};

// 开始取色
const startPicking = async () => {
  // await currentWindow.setFullscreen(true);
  // await currentWindow.setAlwaysOnTop(true);
  try {
    // 1. 设置窗口为透明、无边框、覆盖全屏
    await currentWindow.setDecorations(false);
    await currentWindow.setAlwaysOnTop(true);

    // 2. 获取屏幕尺寸并设置窗口大小
    const { PhysicalSize } = await import("@tauri-apps/api/window");
    const screenSize = await currentWindow.outerSize();
    console.log("屏幕尺寸:", screenSize);
    await currentWindow.setSize(screenSize);
    // await currentWindow.setPosition(0, 0);
    // 截取全屏
    const imageBase64 = await invoke<string>("capture_full_screen");
    fullScreenImage.value = imageBase64;

    isPicking.value = true;
    await invoke("start_color_picking");
    // 监听鼠标移动
    const unlistenMouseMove = await listen<[number, number]>("mouse-moved", (event) => {
      const [x, y] = event.payload;
      mousePosition.value = { x, y };
    });
    cleanupFunctions.push(unlistenMouseMove);

    // 注册快捷键
    await register("Escape", stopPicking);
    // await register("Enter", confirmColor);

    console.log("✅ 像素级取色模式已启动");
  } catch (error) {
    console.error("启动取色模式失败:", error);
    await stopPicking();
  }
};

// 停止取色
const stopPicking = async () => {
  try {
    invoke("stop_color_picking");
    isPicking.value = false;
    fullScreenImage.value = "";
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions = [];
    unregister("Escape");
    emit("plugin-close", true);
    console.log("🚫 取色模式已停止");
    currentWindow.close();
  } catch (error) {
    console.error("停止取色模式失败:", error);
  }
};

// 确认选择颜色
const confirmColor = async () => {
  if (magnifierRef.value) {
    magnifierRef.value.confirmColorSelection();
  }
};

// 处理颜色选择
const onColorPicked = (colorData) => {
  currentColor.value = colorData.color;
  // console.log("🎨 颜色已选择:", colorData);
  stopPicking();
};

// 处理像素变化
const onPixelChange = (pixelData) => {
  // 实时更新颜色信息
  // console.log("当前像素:", pixelData);
};

const togglePicking = async () => {
  if (isPicking.value) {
    await stopPicking();
  } else {
    await startPicking();
  }
};
onMounted(() => {
  setTimeout(() => {
    startPicking();
  }, 0);
});
onUnmounted(() => {
  stopPicking();
});
</script>
