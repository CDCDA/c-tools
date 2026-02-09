<template>
  <div class="color-extraction">
    <!-- 像素级放大镜 -->
    <PixelPerfectMagnifier v-if="isPicking && fullScreenImage" :full-screen-image="fullScreenImage"
      :mouse-position="mousePosition" :magnification="10" :grid-size="9" :view-size="110" @color-picked="onColorPicked"
      ref="magnifierRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { logicalToPhysical, physicalToLogical } from "@/utils/window.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import PixelPerfectMagnifier from "@/components/image/canvasMagnifier.vue";
const props = defineProps({
  type: {
    type: String,
    default: 'colorExtraction',
  },
  fullScreenImage: {
    type: String,
    default: '',
  },
})
interface RgbColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

// 响应式状态
const isPicking = ref(false);
const currentColor = ref<RgbColor | null>(null);
const mousePosition = ref({ x: 0, y: 0 });

const currentWindow = getCurrentWindow();
let cleanupFunctions: (() => void)[] = [];

// 开始取色
const startPicking = async () => {
  try {
    isPicking.value = true;
    currentWindow.setFocus(true);
    currentWindow.show();

    await invoke("start_color_picking");
    // 监听鼠标移动
    const unlistenMouseMove = await listen<[number, number]>("mouse-moved", async (event) => {
      const [x, y] = event.payload;
      const { width, height } = await physicalToLogical(x, y);
      mousePosition.value = { x: width, y: height };
      // console.log(mousePosition.value);
    });
    cleanupFunctions.push(unlistenMouseMove);


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
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions = [];
    console.log("🚫 取色模式已停止");
    currentWindow.hide();
  } catch (error) {
    console.error("停止取色模式失败:", error);
  }
};

// 处理颜色选择
const onColorPicked = (colorData: any) => {
  currentColor.value = colorData.color;
  // console.log("🎨 颜色已选择:", colorData);
  stopPicking();
};

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === "Escape" && isCapturing.value) {
    stopPicking();
  }
};

defineExpose({
  start() {
    document.addEventListener("keydown", handleKeyDown);
    console.log("ASDAD", props.fullScreenImage)
    startPicking();
  },
})
</script>
<style scoped>
.color-extraction {
  height: 100vh;
  background: transparent;
}
</style>
