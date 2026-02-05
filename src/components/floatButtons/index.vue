<template>
  <div class="float-buttons">
    <div class="base-btn-wrap" @click="toggleSettingPanel">
      <slot name="base-btn">
        <div class="base-btn">
          <el-icon class="setting-icon">
            <Setting />
          </el-icon>
        </div>
      </slot>
    </div>
    <div class="float-btns-panel-wrap" :class="{ 'show': isSettingPanelVisible }">
      <slot name="btns">

      </slot>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from "@element-plus/icons-vue";

const isSettingPanelVisible = ref(false);

const toggleSettingPanel = () => {
  isSettingPanelVisible.value = !isSettingPanelVisible.value;
  console.log(isSettingPanelVisible.value);
}


</script>

<style scoped lang="scss">
.float-buttons {
  position: fixed;
  bottom: 10%;
  right: 27px;
  display: flex;
  align-items: center;
  z-index: 1000;
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
  position: fixed;
  bottom: 10%;
  right: 75px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  /* padding: 8px; */
  /* margin-right: 10px; */
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 40px;

  &.show {
    transform: translateX(0);
    opacity: 1;
  }
}

.float-btns-panel-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 20px;
  margin: 0 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover,
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>