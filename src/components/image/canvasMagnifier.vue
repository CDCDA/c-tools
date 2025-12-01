<!-- PixelPerfectMagnifier.vue -->
<template>
  <div class="pixel-magnifier-container" :style="gridOverlayStyle">
    <!-- 隐藏的全屏图像 -->
    <img v-if="fullScreenImage" ref="fullScreenImageRef" :src="fullScreenImage" @load="onFullScreenImageLoad" />

    <!-- 放大镜视图 -->
    <div class="pixel-magnifier-view" :style="magnifierViewStyle">
      <!-- 放大后的像素视图 -->
      <canvas ref="canvasRef" :width="viewSize" :height="viewSize" class="pixel-canvas"></canvas>
      <!-- 网格 -->
      <div class="pixel-grid-overlay">
        <div
          v-for="i in gridSize"
          :key="'h' + i"
          class="grid-line horizontal"
          :style="{ top: (100 / gridSize) * i + '%' }"
        />
        <div
          v-for="i in gridSize"
          :key="'v' + i"
          class="grid-line vertical"
          :style="{ left: (100 / gridSize) * i + '%' }"
        />
        <div class="center-indicator" :style="centerIndicatorStyle" />
      </div>

      <!-- 像素信息 -->
      <div class="pixel-detail-info">
        <div>{{ currentPixelColor.hex }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from "vue";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
// import { ElNotification } from "element-plus";

const props = defineProps({
  fullScreenImage: {
    type: String,
    required: true,
  },
  mousePosition: {
    type: Object,
    required: true,
  },
  magnification: {
    type: Number,
    default: 10,
  },
  gridSize: {
    type: Number,
    default: 9, // 9×9网格
  },
  viewSize: {
    type: Number,
    default: 300,
  },
});

const emits = defineEmits(["pixel-change", "color-picked"]);

// Refs
const fullScreenImageRef = ref(null);
const canvasRef = ref(null);

// 状态
const showMagnifier = ref(false);
const canvasReady = ref(false);
const fullScreenDimensions = reactive({ width: 0, height: 0 });

// 当前像素信息
const currentPixel = reactive({ x: 0, y: 0 });
const currentPixelColor = reactive({ r: 0, g: 0, b: 0, hex: "#000000" });
const dominantColor = reactive({ r: 255, g: 255, b: 255 }); // 默认白色

// 计算属性
const cellSize = computed(() => props.viewSize / props.gridSize);

// 计算对比色（确保网格可见）
const contrastingColor = computed(() => {
  const { r, g, b } = dominantColor;
  // 计算亮度 (使用相对亮度公式)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // 如果背景较亮，使用深色网格；如果背景较暗，使用浅色网格
  return brightness > 128 ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)";
});

// 计算中心指示器颜色（与网格颜色形成对比）
const centerIndicatorColor = computed(() => {
  const { r, g, b } = dominantColor;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#e74c3c" : "#f39c12"; // 暗背景用橙色，亮背景用红色
});

// 网格叠加层样式
const gridOverlayStyle = computed(() => ({
  "--grid-color": contrastingColor.value,
}));

// 中心指示器样式
const centerIndicatorStyle = computed(() => ({
  borderColor: centerIndicatorColor.value,
  width: `${cellSize.value + 2}px`,
  height: `${cellSize.value + 2}px`,
  left: `calc(50% - ${cellSize.value / 2 + 0.5}px)`,
  top: `calc(50% - ${cellSize.value / 2 + 0.5}px)`,
}));

// 放大视图样式
const magnifierViewStyle = computed(() => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = props.mousePosition.x + 20;
  let top = props.mousePosition.y + 20;

  if (left + props.viewSize > viewportWidth) {
    left = props.mousePosition.x - props.viewSize - 20;
  }

  if (top + props.viewSize > viewportHeight) {
    top = props.mousePosition.y - props.viewSize - 20;
  }

  return {
    width: `${props.viewSize + 2}px`,
    height: `${props.viewSize + 30}px`,
    left: `${left}px`,
    top: `${top}px`,
  };
});

// 加载全屏图像
const onFullScreenImageLoad = () => {
  const img = fullScreenImageRef.value;
  if (!img) return;

  fullScreenDimensions.width = img.naturalWidth;
  fullScreenDimensions.height = img.naturalHeight;
  canvasReady.value = true;

  console.log("全屏图像加载完成:", fullScreenDimensions);
};

// 计算放大区域的主体色
const calculateDominantColor = async (startX, startY, width, height) => {
  if (!fullScreenImageRef.value) return;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = width;
  tempCanvas.height = height;

  // 绘制区域到临时canvas
  tempCtx.drawImage(fullScreenImageRef.value, startX, startY, width, height, 0, 0, width, height);

  // 获取图像数据
  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 计算平均颜色
  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = width * height;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  dominantColor.r = Math.round(r / pixelCount);
  dominantColor.g = Math.round(g / pixelCount);
  dominantColor.b = Math.round(b / pixelCount);
};

// 更新像素视图
const updatePixelView = async () => {
  if (!canvasRef.value || !fullScreenImageRef.value || !canvasReady.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  const fullScreenImg = fullScreenImageRef.value;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 设置当前像素坐标
  currentPixel.x = props.mousePosition.x;
  currentPixel.y = props.mousePosition.y;

  // 计算要显示的区域
  const startX = Math.max(0, props.mousePosition.x - Math.floor(props.gridSize / 2));
  const startY = Math.max(0, props.mousePosition.y - Math.floor(props.gridSize / 2));
  const endX = Math.min(fullScreenDimensions.width, startX + props.gridSize + 2);
  const endY = Math.min(fullScreenDimensions.height, startY + props.gridSize + 2);

  const sourceWidth = endX - startX;
  const sourceHeight = endY - startY;

  if (sourceWidth > 0 && sourceHeight > 0) {
    // 计算主体色
    await calculateDominantColor(startX, startY, sourceWidth, sourceHeight);

    // 使用 canvas 绘制放大后的像素
    ctx.imageSmoothingEnabled = false;

    // 直接绘制源图像区域到放大视图
    ctx.drawImage(fullScreenImg, startX, startY, sourceWidth, sourceHeight, 0, 0, props.viewSize, props.viewSize);

    // 获取中心像素颜色
    await getPixelColor(props.mousePosition.x, props.mousePosition.y);
  }

  showMagnifier.value = true;
};

// 获取精确像素颜色
const getPixelColor = async (x, y) => {
  if (
    !fullScreenImageRef.value ||
    x < 0 ||
    y < 0 ||
    x >= fullScreenDimensions.width ||
    y >= fullScreenDimensions.height
  ) {
    return;
  }

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = 1;
  tempCanvas.height = 1;

  tempCtx.drawImage(fullScreenImageRef.value, x, y, 1, 1, 0, 0, 1, 1);

  const imageData = tempCtx.getImageData(0, 0, 1, 1);
  const [r, g, b] = imageData.data;

  currentPixelColor.r = r;
  currentPixelColor.g = g;
  currentPixelColor.b = b;
  currentPixelColor.hex = rgbToHex(r, g, b);

  emits("pixel-change", {
    x,
    y,
    color: { r, g, b, hex: currentPixelColor.hex },
  });
};

// RGB 转 HEX
const rgbToHex = (r, g, b) => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16).padStart(2, "0");
        return hex;
      })
      .join("")
  );
};

// 监听鼠标位置变化
watch(
  () => props.mousePosition,
  () => {
    updatePixelView();
  },
  { deep: true }
);

// 鼠标点击事件处理
const handleMouseDown = (event) => {
  if (event.button === 0) {
    // 左键
    event.preventDefault();
    event.stopPropagation();
    writeText(currentPixelColor.hex);
    // ElNotification({
    //   message: "已复制到剪贴板",
    //   type: "success",
    // });
    emits("color-picked", currentPixelColor.hex);
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleMouseDown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleMouseDown);
});

// 暴露方法给父组件
defineExpose({
  getCurrentColor: () => ({ ...currentPixelColor }),
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

/* 像素级放大视图 */
.pixel-magnifier-view {
  position: fixed;
  background: transparent;
  z-index: 10001;
  overflow: auto;
}

.pixel-canvas {
  display: block;
  border-radius: 4px;
  border: 1px solid var(--grid-color);
  image-rendering: pixelated;
}

/* 网格叠加层 */
.pixel-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  aspect-ratio: 1 / 1;
  pointer-events: none;
  border-radius: 4px;
  overflow: hidden;
}

.pixel-grid-overlay .grid-line {
  position: absolute;
  background: var(--grid-color, rgba(0, 0, 0, 0.4));
}

.pixel-grid-overlay .grid-line.horizontal {
  width: 100%;
  height: 1px;
}

.pixel-grid-overlay .grid-line.vertical {
  width: 1px;
  height: 100%;
}

.center-indicator {
  position: absolute;
  border: 2px solid;
  pointer-events: none;
  box-sizing: border-box;
  z-index: 9999;
}

/* 像素信息 */
.pixel-detail-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  width: calc(100% - 0px);
  font-size: 12px;
  font-family: "Courier New", monospace;
  line-height: 20px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.pixel-detail-info div {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
