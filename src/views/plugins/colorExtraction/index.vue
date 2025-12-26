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
      @color-picked="onColorPicked"
      ref="magnifierRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { logicalToPhysical, physicalToLogical } from "@/utils/window.ts";
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

const currentWindow = getCurrentWindow();
let cleanupFunctions: (() => void)[] = [];

// 开始取色
const startPicking = async () => {
  try {
    // 1. 设置窗口为透明、无边框、覆盖全屏
    const imageBase64 = await invoke<string>("capture_full_screen");
    fullScreenImage.value = imageBase64;
    isPicking.value = true;

    await currentWindow.setAlwaysOnTop(true);
    const screenSize = await currentWindow.outerSize();
    await currentWindow.setSize(screenSize);
    await currentWindow.show();

    // await currentWindow.setPosition(0, 0);
    // 截取全屏

    await invoke("start_color_picking");
    // 监听鼠标移动
    const unlistenMouseMove = await listen<[number, number]>(
      "mouse-moved",
      (event) => {
        const [x, y] = event.payload;
        mousePosition.value = physicalToLogical(x, y);
        console.log(mousePosition.value); 
      }
    );
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

// 处理颜色选择
const onColorPicked = (colorData: any) => {
  currentColor.value = colorData.color;
  // console.log("🎨 颜色已选择:", colorData);
  stopPicking();
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
