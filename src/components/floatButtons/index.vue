<template>
  <div class="float-buttons" v-drag="{ dragSelf: true }">
    <div class="base-btn-wrap" @click="
      toggleSettingPanel">
      <slot name="base-btn">
        <div class="base-btn">
          <svg-icon iconName="otherSvg-设置" class="setting-icon" />
        </div>
      </slot>
    </div>
    <div v-if="props.type === 'panel'" class="float-btns-panel-wrap" :class="{ 'show': isSettingPanelVisible }">
      <slot name="btns">
      </slot>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from "@element-plus/icons-vue";
import { vDrag } from "@/directive/drag.ts";
const props = defineProps({
  type: {
    type: String,
    default: 'panel'
  }

})
const emit = defineEmits(['baseClick']);
const isSettingPanelVisible = ref(false);

const toggleSettingPanel = () => {
  if (props.type === 'panel') {
    isSettingPanelVisible.value = !isSettingPanelVisible.value;
    console.log(isSettingPanelVisible.value);
  } else {
    emit('baseClick');
  }
}


</script>

<style scoped lang="scss">
.float-buttons {
  position: fixed; // 拖拽时，指令会修改这个元素的 top 和 left
  top: calc(100% - 92px);
  left: calc(100% - 67px);
  display: flex;
  align-items: center;
  z-index: 1000;
  // 确保父容器能够包裹住内容
  height: 40px;
}

.base-btn-wrap {
  z-index: 10;
  flex-shrink: 0; // 防止被挤压

}

.base-btn-wrap {
  z-index: 10;
}

.base-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  // background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  // &:hover {
  //   background-color: #e0e0e0;
  //   transform: scale(1.05);
  // }
}

.setting-icon {
  font-size: 24px;
}

.float-btns-panel-wrap {
  /* 关键修改：从 fixed 改为 absolute */
  position: absolute;

  /* 相对于父容器 .float-buttons 定位 */
  /* 假设你想让面板出现在按钮的左侧 */
  right: 50px;
  top: 50%;
  transform: translateY(-50%) translateX(20%); // 默认隐藏在右侧偏移处

  padding: 0 10px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 40px;
  white-space: nowrap; // 防止内容换行

  &.show {
    /* 展开时的状态 */
    transform: translateY(-50%) translateX(0);
    opacity: 1;
  }
}
</style>