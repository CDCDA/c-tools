<!-- PixelPerfectMagnifier.vue -->
<template>
  <div class="pixel-magnifier-container" :style="rootStyle">
    <!-- 隐藏的全屏图像 -->
    <img
      v-if="fullScreenImage"
      ref="fullScreenImageRef"
      :src="fullScreenImage"
      @load="onFullScreenImageLoad"
      style="display: none"
    />

    <!-- 放大镜视图 -->
    <div class="pixel-magnifier-view" :style="magnifierViewStyle">
      <!-- 像素视图层 -->
      <div class="canvas-wrapper" :style="canvasWrapperStyle">
        <canvas ref="canvasRef" :width="actualViewSize" :height="actualViewSize" class="pixel-canvas"></canvas>

        <!-- 网格层：使用 CSS 绘制，确保绝对对齐 -->
        <div class="pixel-grid-overlay"></div>

        <!-- 中心指示器 -->
        <div class="center-indicator"></div>
      </div>

      <!-- 像素信息底栏 -->
      <div class="pixel-detail-info flex-center">
        {{ currentPixelColor.hex.toUpperCase() }}
        <!-- <span class="pos-info">({{ mousePosition.x }}, {{ mousePosition.y }})</span> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from "vue";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

const props = defineProps({
  fullScreenImage: { type: String, required: true },
  mousePosition: { type: Object, required: true },
  gridSize: { type: Number, default: 9 }, // 建议设为奇数，这样中心点正好是一个像素
  cellSize: { type: Number, default: 14 }, // 每个像素显示的实际物理大小（建议设为整数）
});

const emits = defineEmits(["pixel-change", "color-picked"]);

const fullScreenImageRef = ref(null);
const canvasRef = ref(null);
const fullScreenDimensions = reactive({ width: 0, height: 0 });
const currentPixelColor = reactive({ r: 0, g: 0, b: 0, hex: "#000000" });
const dominantBrightness = ref(255);

// --- 计算属性 ---

// 实际视口大小 = 网格数量 * 每个格子的大小
const actualViewSize = computed(() => props.gridSize * props.cellSize);

// 计算对比色
const contrastColor = computed(() => {
  return dominantBrightness.value > 128 ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.4)";
});

const rootStyle = computed(() => ({
  "--cell-size": `${props.cellSize}px`,
  "--grid-color": contrastColor.value,
  "--indicator-color": dominantBrightness.value > 128 ? "#ff4757" : "#eccc68",
}));

const canvasWrapperStyle = computed(() => ({
  width: `${actualViewSize.value}px`,
  height: `${actualViewSize.value}px`,
  borderColor: rootStyle.value["--grid-color"],
}));

const magnifierViewStyle = computed(() => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const offset = 20;
  let left = props.mousePosition.x + offset;
  let top = props.mousePosition.y + offset;

  // 边界检查：防止放大镜超出屏幕
  if (left + actualViewSize.value > viewportWidth) {
    left = props.mousePosition.x - actualViewSize.value - offset;
  }
  if (top + actualViewSize.value + 30 > viewportHeight) {
    top = props.mousePosition.y - actualViewSize.value - offset - 30;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});

// --- 逻辑处理 ---

const onFullScreenImageLoad = () => {
  if (!fullScreenImageRef.value) return;
  fullScreenDimensions.width = fullScreenImageRef.value.naturalWidth;
  fullScreenDimensions.height = fullScreenImageRef.value.naturalHeight;
  updatePixelView();
};

const updatePixelView = () => {
  if (!canvasRef.value || !fullScreenImageRef.value) return;

  const ctx = canvasRef.value.getContext("2d");
  const img = fullScreenImageRef.value;

  // 1. 计算裁剪区域
  // 目标是让 mousePosition 处于 gridSize 的正中心
  const halfGrid = Math.floor(props.gridSize / 2);
  const sx = props.mousePosition.x - halfGrid;
  const sy = props.mousePosition.y - halfGrid;

  // 2. 清除画布并绘制
  ctx.clearRect(0, 0, actualViewSize.value, actualViewSize.value);

  // 关闭抗锯齿，这是像素对齐的关键
  ctx.imageSmoothingEnabled = false;

  // 3. 绘制图像 (将 1:1 的像素区域放大到 actualViewSize)
  // 注意：这里即便 sx, sy 是负数或超出范围，drawImage 也会自动处理或不画，
  // 但为了背景色统一，可以先填黑底
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, actualViewSize.value, actualViewSize.value);

  ctx.drawImage(
    img,
    sx,
    sy,
    props.gridSize,
    props.gridSize, // 源代码区域
    0,
    0,
    actualViewSize.value,
    actualViewSize.value // 目标绘制区域
  );

  // 4. 获取中心像素颜色和亮度
  updateCurrentColor(ctx);
};

const updateCurrentColor = (ctx) => {
  // 从画布中心取样（因为我们已经把目标像素移到中心了）
  const centerCoord = Math.floor(props.gridSize / 2) * props.cellSize + props.cellSize / 2;
  const pixelData = ctx.getImageData(centerCoord, centerCoord, 1, 1).data;

  const [r, g, b] = pixelData;
  currentPixelColor.r = r;
  currentPixelColor.g = g;
  currentPixelColor.b = b;
  currentPixelColor.hex = rgbToHex(r, g, b);

  // 计算感知亮度 (Rec. 709)
  dominantBrightness.value = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  emits("pixel-change", { x: props.mousePosition.x, y: props.mousePosition.y, color: { ...currentPixelColor } });
};

const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

const handleMouseDown = (event) => {
  if (event.button === 0) {
    writeText(currentPixelColor.hex);
    emits("color-picked", currentPixelColor.hex);
  }
};

watch(() => props.mousePosition, updatePixelView, { deep: true });

onMounted(() => {
  document.addEventListener("mousedown", handleMouseDown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleMouseDown);
});
</script>

<style scoped>
.pixel-magnifier-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.pixel-magnifier-view {
  position: fixed;
  background: #1e1e1e;
  /* border: 2px solid #444; */
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.canvas-wrapper {
  position: relative;
  background-size: var(--cell-size) var(--cell-size);
  overflow: hidden;
}

.pixel-canvas {
  display: block;
  /* 确保渲染出来的像素没有模糊 */
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* 关键：使用 CSS Grid Overlay 确保对齐 */
.pixel-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 绘制 1px 的网格线 */
  background-image:
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  background-size: var(--cell-size) var(--cell-size);
  pointer-events: none;
}

/* 中心指示器：确保正好框住中心像素 */
.center-indicator {
  position: absolute;
  /* 计算中心位置 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--cell-size);
  height: var(--cell-size);
  border: 2px solid var(--indicator-color);
  box-sizing: border-box;
  z-index: 10;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.pixel-detail-info {
  height: 28px;
  background: #000;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-top: 1px solid #333;
}

.pos-info {
  color: #888;
}

.canvas-wrapper {
  position: relative;
  /* 移除这里的 background-size，由 overlay 统一处理 */
  overflow: hidden;
  /* 确保容器尺寸精确 */
  box-sizing: content-box;
}

.pixel-canvas {
  display: block;
  image-rendering: pixelated;
  /* 防止 canvas 产生微小的位移 */
  vertical-align: middle;
}

/* 修正后的网格层 */
.pixel-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* 1. 内部线条：左侧和上方 */
  background-image:
    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  background-size: var(--cell-size) var(--cell-size);

  /* 2. 外部线条：补全右侧和下方 */
  /* 使用 border 补全最后一行/一列的缺失线条 */
  border-right: 1px solid var(--grid-color);
  border-bottom: 1px solid var(--grid-color);

  /* 3. 必须设置为 border-box，否则 border 会撑大容器导致对齐失效 */
  box-sizing: border-box;

  pointer-events: none;
  z-index: 5;
}

/* 如果你希望最左侧和最上方也有明显的深色边框，可以把 border 全开 */
/*
.pixel-grid-overlay {
  ...
  border: 1px solid var(--grid-color);
  box-sizing: border-box;
}
*/

.center-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--cell-size);
  height: var(--cell-size);
  /* 增加层级，确保在网格线上方 */
  z-index: 10;
  border: 2px solid var(--indicator-color);
  box-sizing: border-box;
  /* 让中心指示器略微突出，避免被网格线完全遮挡 */
  outline: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
