<!-- ImageMagnifier.vue -->
<template>
  <div class="magnifier-container" ref="containerRef" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <div class="grid-overlay">
      <div v-for="i in 8" :key="'h' + i" class="grid-line horizontal" :style="{ top: (i * 100) / 9 + '%' }"></div>
      <div v-for="i in 8" :key="'v' + i" class="grid-line vertical" :style="{ left: (i * 100) / 9 + '%' }"></div>

      <!-- 中心高亮方格 -->
      <div class="crosshair" :style="{ width: `${lensSize / 9}px`, height: `${lensSize / 9}px` }"></div>
    </div>
    <img
      :src="imageUrl"
      :style="{
        width: magnifierViewSize * magnification + 'px',
        height: magnifierViewSize * magnification + 'px',
        left: `calc(-50% - ${(magnifierViewSize * magnification) / 2 - magnifierViewSize}px)`,
        top: `calc(-50% - ${(magnifierViewSize * magnification) / 2 - magnifierViewSize}px)`,
      }"
      alt="Original Image"
      class="original-image"
      @load="onImageLoad"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  magnification: {
    type: Number,
    default: 15, // 提高默认放大倍数以实现像素级效果
  },
  lensSize: {
    type: Number,
    default: 180, // 增大镜头尺寸以容纳9×9网格
  },
  magnifierViewSize: {
    type: Number,
    default: 150,
  },
  internalMagnifier: {
    type: Boolean,
    default: false,
  },
  // 新增：显示像素信息
  showPixelInfo: {
    type: Boolean,
    default: true,
  },
});

const containerRef = ref(null);
const showMagnifier = ref(false);
const mousePos = reactive({ x: 0, y: 0 });

const imgRenderedDimensions = reactive({ width: 0, height: 0 });
const imgNaturalDimensions = reactive({ width: 0, height: 0 });

// 当前像素信息
const currentPixelInfo = ref("");

const onImageLoad = (event) => {
  const img = event.target;
  imgRenderedDimensions.width = img.clientWidth;
  imgRenderedDimensions.height = img.clientHeight;
  imgNaturalDimensions.width = img.naturalWidth;
  imgNaturalDimensions.height = img.naturalHeight;
};

// 计算中心像素位置
const centerPixel = computed(() => {
  if (!imgRenderedDimensions.width) return { x: 0, y: 0 };

  const scaleX = imgNaturalDimensions.width / imgRenderedDimensions.width;
  const scaleY = imgNaturalDimensions.height / imgRenderedDimensions.height;

  return {
    x: Math.floor(mousePos.x * scaleX),
    y: Math.floor(mousePos.y * scaleY),
  };
});

// 监听中心像素变化，更新像素信息
watch(centerPixel, (newPixel) => {
  if (props.showPixelInfo) {
    currentPixelInfo.value = `X:${newPixel.x} Y:${newPixel.y}`;
  }
});

const lensStyle = computed(() => {
  const left = mousePos.x - props.lensSize / 2;
  const top = mousePos.y - props.lensSize / 2;

  return {
    width: `${props.lensSize}px`,
    height: `${props.lensSize}px`,
    left: `${left}px`,
    top: `${top}px`,
  };
});

const magnifierViewStyle = computed(() => {
  if (!containerRef.value || !imgRenderedDimensions.width) return {};

  const { width: renderedWidth, height: renderedHeight } = imgRenderedDimensions;
  const { width: naturalWidth, height: naturalHeight } = imgNaturalDimensions;

  if (naturalWidth === 0 || naturalHeight === 0) return {};

  const scaleX = naturalWidth / renderedWidth;
  const scaleY = naturalHeight / renderedHeight;

  const mouseXOnRenderedImg = mousePos.x;
  const mouseYOnRenderedImg = mousePos.y;

  const mouseXOnNaturalImg = mouseXOnRenderedImg * scaleX;
  const mouseYOnNaturalImg = mouseYOnRenderedImg * scaleY;

  // 像素级对齐：确保放大视图以像素边界为中心
  const pixelAlignedX = Math.floor(mouseXOnNaturalImg);
  const pixelAlignedY = Math.floor(mouseYOnNaturalImg);

  const bgPosX = -(pixelAlignedX - props.magnifierViewSize / 2 / props.magnification) * props.magnification;
  const bgPosY = -(pixelAlignedY - props.magnifierViewSize / 2 / props.magnification) * props.magnification;

  const bgSizeX = naturalWidth * props.magnification;
  const bgSizeY = naturalHeight * props.magnification;

  let baseStyle = {
    width: `${props.magnifierViewSize}px`,
    height: `${props.magnifierViewSize}px`,
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
    backgroundPosition: `${bgPosX}px ${bgPosY}px`,
    imageRendering: "pixelated", // 确保像素级渲染
  };

  if (props.internalMagnifier) {
    const viewLeft = mousePos.x - props.magnifierViewSize / 2;
    const viewTop = mousePos.y - props.magnifierViewSize / 2;
    return {
      ...baseStyle,
      left: `${viewLeft}px`,
      top: `${viewTop}px`,
    };
  } else {
    return {
      ...baseStyle,
      top: `0px`,
      left: `100%`,
      marginLeft: `10px`,
    };
  }
});

const handleMouseMove = (event) => {
  if (!containerRef.value) return;

  const { left, top } = containerRef.value.getBoundingClientRect();
  mousePos.x = event.clientX - left;
  mousePos.y = event.clientY - top;
  showMagnifier.value = true;
};

const handleMouseLeave = () => {
  showMagnifier.value = false;
  currentPixelInfo.value = "";
};
</script>

<style scoped>
.magnifier-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: inline-block;
  cursor: crosshair;
  border: 1px solid #eee;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    top: -50%;
    left: -50%;
    position: absolute;
  }
  .crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid #000;
    transform: translate(-50%, -50%);
  }
  .grid-overlay {
    width: 100%;
    height: 100%;
    z-index: 1000;
    position: absolute;

    pointer-events: none;
    .grid-line.horizontal {
      position: absolute;

      height: 1px;
      width: 100%;
      background-color: #dcdcdc;
    }
    .grid-line.vertical {
      position: absolute;

      width: 1px;
      height: 100%;
      background-color: #dcdcdc;
    }
  }
}
</style>
