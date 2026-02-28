<template>
  <div class="plugin-manage-bar" data-tauri-drag-region>
    <div class="plugin-manage-bar-left" data-tauri-drag-region>
      <el-tag class="plugin-manage-name" effect="dark" round closable type="primary" @close="handleClick">插件管理</el-tag>
    </div>
    <div class="plugin-manage-bar-right" data-tauri-drag-region>
      <svg-icon iconName="pluginIcons-icon" class="plugin-icon" @click="handleClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

function handleClick() {
  router.push({ name: "pluginSearch" });
}
</script>

<style lang="scss" scoped>
.plugin-manage-bar {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;

  user-select: none;
  border-bottom: 1px solid #EBEBEB;

  .plugin-manage-bar-left {
    height: 100%;
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .plugin-manage-name {
      height: 32px;
      font-size: 18px;
      padding-right: 15px;
      padding-left: 20px;
      // background-color: #409eff;
      color: #fff;
      border: none;

      :deep(.el-tag__content) {
        margin-bottom: 4px;
      }

      :deep(.el-tag__close) {
        width: 20px;
        height: 20px;
        font-size: 20px;
      }
    }
  }

  .plugin-manage-bar-right {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;

    .plugin-icon {
      width: 35px;
      height: 30px;
      border-radius: 30px;
      cursor: pointer;
    }
  }
}
</style>