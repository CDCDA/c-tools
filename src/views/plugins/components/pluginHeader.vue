<template>
  <div class="plugin-header" data-tauri-drag-region v-if="props.plugin.showHeader">
    <div class="plugin-header-left" data-tauri-drag-region>
      <svg-icon :iconName="props.plugin.icon" data-tauri-drag-region></svg-icon>
      <div data-tauri-drag-region>{{ props.plugin.label }}</div>
    </div>
    <div class="plugin-header-center" data-tauri-drag-region>
      <svg-icon iconName="otherSvg-搜索" v-if="props.plugin.meta.search"
        style="margin-left: 20px; width: 23px; height: 23px;cursor: pointer" @click="handleSearch"></svg-icon>

      <el-input class="plugin-header-search" v-model="searchText" data-tauri-drag-region v-prevent-drag
        v-if="props.plugin.meta.search" @keyup.enter="handleSearch()" placeholder="请输入关键字" />
    </div>
    <div class="plugin-header-right" data-tauri-drag-region>
      <svg-icon iconName="otherSvg-缩小" @click="lessen" />
      <svg-icon iconName="otherSvg-新增" v-if="plugin.meta.add"
        style="color:#666666; width: 29px; height: 29px; margin-right: 5px; cursor: pointer;z-index: 10;"
        @click="handleAdd"></svg-icon>
      <!-- <svg-icon iconName="otherSvg-放大窗口" @click="blowUp" v-if="!isFull" />
      <svg-icon iconName="otherSvg-缩小窗口" @click="blowDown" v-else /> -->

      <svg-icon iconName="otherSvg-未固定" style="font-size: 22px" @click="fixed" v-if="!isFixed" />
      <svg-icon iconName="otherSvg-已固定" style="font-size: 22px" @click="fixed" v-else />
      <svg-icon iconName="otherSvg-关闭" @click="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
const props = defineProps({
  plugin: {
    type: Object,
    default: () => ({}),
  },
});
function handleAdd() {
  console.log("handleAdd")
  emit("pluginDataAdd");
}
const isFixed = ref(true) as any;
const isFull = ref(false) as any;
const searchText = ref("");
onMounted(async () => {
  isFixed.value = currentWindow.isAlwaysOnTop();
});
function handleSearch() {
  emit("pluginSearch", searchText.value);
}
const lessen = () => {
  currentWindow.minimize();
};

const blowDown = () => {
  currentWindow.unmaximize();
  isFull.value = false;
};
const blowUp = () => {
  currentWindow.maximize();
  isFull.value = true;
};
const close = () => {
  currentWindow.close();
};

const fixed = () => {
  isFixed.value = !isFixed.value;
  currentWindow.setAlwaysOnTop(isFixed.value);
};

const emit = defineEmits(["pluginSearch", "pluginDataAdd"]);
currentWindow.setAlwaysOnTop(isFixed.value);

</script>

<style lang="scss" scoped>
.plugin-header {
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  padding: 8px 0 0 8px;

  .plugin-header-search {
    height: 100%;

    :deep(.el-input__wrapper) {
      padding-left: 5px;
      border-radius: 0 !important;
      box-shadow: none;
      background: transparent;

      .el-input__inner {
        font-size: 18px !important;
      }
    }
  }

  // border-bottom: 1px solid #ebebeb;

  .svg-icon {
    margin-right: 5px;
  }

  .plugin-header-left {
    height: 100%;
    margin: 0 20px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-weight: bold;
    z-index: 10;
    font-size: 20px;
  }

  .plugin-header-center {

    flex: 1;
    display: flex;
    align-items: center;
    justify-content: start;

  }

  .plugin-header-right {
    height: 100%;
    width: 150px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;

    .svg-icon {
      font-size: 25px;
      margin-left: 3px;
      cursor: pointer;
      color: rgb(99, 99, 99);
    }
  }

  .plugin-header-search {
    height: 100%;

    :deep(.el-input__wrapper) {
      padding-left: 22px;
      border-radius: 0 !important;
      box-shadow: none;

      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}
</style>
