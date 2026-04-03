<template>
  <div class="plugin-header" data-tauri-drag-region v-if="props.plugin.showHeader">
    <div class="plugin-header-left" data-tauri-drag-region>
      <slot name="left">
        <component :is="leftComponent" v-if="leftComponent" v-bind="leftProps" @navigate="handleNavigate"
          @update:url="handleUrlUpdate" />
      </slot>
      <template v-if="!leftComponent">
        <svg-icon :iconName="props.plugin.icon" data-tauri-drag-region></svg-icon>
        <div data-tauri-drag-region>{{ props.plugin.label }}</div>
      </template>
    </div>
    <div class="plugin-header-center" data-tauri-drag-region>
      <slot name="center">
        <component :is="centerComponent" v-if="centerComponent" v-bind="centerProps" @search="handleSearch"
          @navigate="handleNavigate" @update:url="handleUrlUpdate" />
        <template v-else>
          <svg-icon iconName="otherSvg-搜索" v-if="props.plugin.meta.search"
            style="margin-left: 20px; width: 23px; height: 23px;cursor: pointer" @click="handleSearchClick"></svg-icon>
          <el-input class="plugin-header-search" v-model="searchText" data-tauri-drag-region v-prevent-drag
            v-if="props.plugin.meta.search" @keyup.enter="handleSearchClick()" placeholder="请输入关键字" />
        </template>
      </slot>
    </div>
    <div class="plugin-header-right" data-tauri-drag-region>
      <slot name="right">
        <svg-icon iconName="otherSvg-缩小" @click="lessen" />
        <svg-icon iconName="otherSvg-新增" v-if="plugin.meta.add"
          style="color:#666666; width: 29px; height: 29px; margin-right: 5px; cursor: pointer;z-index: 10;"
          @click="handleAdd"></svg-icon>
        <svg-icon iconName="otherSvg-未固定" style="font-size: 22px" @click="fixed" v-if="!isFixed" />
        <svg-icon iconName="otherSvg-已固定" style="font-size: 22px" @click="fixed" v-else />
        <svg-icon iconName="otherSvg-关闭" @click="close" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getHeaderComponent } from "./headerRegistry";

const currentWindow = getCurrentWindow();
const props = defineProps({
  plugin: {
    type: Object,
    default: () => ({}),
  },
  headerConfig: {
    type: Object,
    default: () => null,
  },
});

const headerConfig = computed(() => props.headerConfig || props.plugin?.meta?.headerConfig);

const leftComponent = computed(() => {
  const name = headerConfig.value?.left;
  if (!name) return null;
  return getHeaderComponent(name);
});

const centerComponent = computed(() => {
  const name = headerConfig.value?.center;
  if (!name) return null;
  return getHeaderComponent(name);
});

const leftProps = computed(() => ({
  ...(headerConfig.value?.leftProps || {}),
  url: headerUrl.value
}));

const centerProps = computed(() => ({
  ...(headerConfig.value?.centerProps || {}),
  url: headerUrl.value
}));

const headerUrl = ref("");

const isFixed = ref(true) as any;
const searchText = ref("");

onMounted(async () => {
  isFixed.value = await currentWindow.isAlwaysOnTop();
  currentWindow.setAlwaysOnTop(isFixed.value);
});

function handleAdd() {
  emit("pluginDataAdd");
}

function handleSearchClick() {
  emit("pluginSearch", searchText.value);
}

function handleSearch(value: string) {
  emit("pluginSearch", value);
}

function handleNavigate(url: string) {
  emit("navigate", url);
}

function handleUrlUpdate(url: string) {
  headerUrl.value = url;
  emit("update:url", url);
}

const lessen = () => {
  currentWindow.minimize();
};

const close = () => {
  currentWindow.close();
};

const fixed = () => {
  isFixed.value = !isFixed.value;
  currentWindow.setAlwaysOnTop(isFixed.value);
};

const emit = defineEmits(["pluginSearch", "pluginDataAdd", "navigate", "update:url"]);
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
  padding: 2px 0 0 4px;

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
      background: transparent;

      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}
</style>
