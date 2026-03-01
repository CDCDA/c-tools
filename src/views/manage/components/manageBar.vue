<template>
  <div class="manage-bar" data-tauri-drag-region>
    <div class="manage-bar-left" data-tauri-drag-region>
      <!-- <el-tag class="manage-name" effect="dark" round closable type="info" @close="handleClick">管理中心</el-tag> -->
      <div class="manage-name">
        <!-- <svg-icon :iconName="" style="margin-right: 5px" /> -->
        <div style="margin-bottom: 2px">{{ "管理中心" }}</div>
        <svg-icon
          iconName="otherSvg-关闭"
          style="cursor: pointer; margin-left: 5px; width: 22px; height: 22px"
          @click="handleClick"
        />
      </div>
    </div>
    <div class="manage-bar-right" data-tauri-drag-region>
      <svg-icon
        iconName="pluginIcons-icon"
        class="plugin-icon"
        @click="handleClick"
      />
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
.manage-bar {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;

  user-select: none;
  border-bottom: 1px solid #ebebeb;

  .manage-bar-left {
    height: 100%;
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .manage-bar-right {
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

    .manage {
      font-size: 25px;
      cursor: pointer;
    }
  }

  .manage-bar-search {
    height: 100%;

    :deep(.el-input__wrapper) {
      padding-left: 25px;
      border-radius: 0 !important;
      box-shadow: none;

      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}
.manage-name {
  height: 32px;
  font-size: 18px;
  padding-right: 15px;
  padding-left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: var(--el-color-primary);
  color: black;
  font-weight: bold;
  border: none;

  .plugin-close {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
