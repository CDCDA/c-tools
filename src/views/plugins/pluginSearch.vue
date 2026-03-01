<template>
  <div class="plugin-search">
    <div class="plugin-search-header-bar" data-tauri-drag-region>
      <div class="plugin-search-header-bar-left" data-tauri-drag-region>
        <svg-icon
          iconName="otherSvg-搜索"
          v-if="!loading"
          data-tauri-drag-region
          style="margin-left: 20px; width: 23px; height: 23px"
        ></svg-icon>
        <el-input
          v-if="!loading"
          class="plugin-search-header-bar-search"
          data-tauri-drag-region
          v-model="searchText"
          @input="handleSearch"
          v-prevent-drag
          placeholder="请输入命令/应用"
        />
        <div class="plugin-name" v-else>
          <svg-icon
            :iconName="currentPlugin.meta.icon"
            style="margin-right: 5px"
          />
          <div style="margin-bottom: 2px">{{ currentPlugin.label }}</div>
          <!-- <svg-icon iconName="otherSvg-关闭" style="cursor: pointer;margin-left: 5px;width: 22px;height: 22px;"
            @click="close" /> -->
        </div>
      </div>
      <div class="plugin-search-header-bar-right" data-tauri-drag-region>
        <c-image
          v-if="!loading"
          class="user-avatar"
          :src="avatarUrl"
          @click="handleAvatarClick"
        ></c-image>
        <div class="loading-spinner" v-else v-loading="loading"></div>
      </div>
    </div>
    <div class="plugin-list-container" :class="loading ? 'loading' : ''">
      <div class="plugin-wrap">
        <!-- <div class="title">最近使用</div> -->
        <div class="plugin-list recent-used">
          <div
            class="plugin-item"
            v-for="plugin in plugins"
            :key="plugin.id"
            @click="selectPlugin(plugin, router)"
          >
            <svg-icon style="color: #666666" :iconName="plugin.icon" />
            <div class="plugin-item-title">{{ plugin.label }}</div>
          </div>
        </div>
      </div>
      <!-- <div class="plugin-wrap" v-if="searchText">
        <div class="title">最佳匹配</div>
        <div class="plugin-list recent-used">
          <div class="plugin-item" v-for="plugin in bestMatchPlugins" :key="plugin.id" @click="selectPlugin(plugin)">
            <svg-icon :iconName="plugin.icon" />
            <div class="plugin-item-title">{{ plugin.name }}</div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onActivated } from "vue";
import { vPreventDrag } from "@/directive/preventDrag.ts";
import { pluginData, selectPlugin } from "@/utils/plugin.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { adjustWindowSize, setWindowSize } from "@/utils/window.ts";
import { useSettingStore } from "@/store/modules/setting.ts";
import { useRouter } from "vue-router";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
const eventBusStore = useEventBusStore();
const loading = computed(() => eventBusStore.pluginLoading);
const currentPlugin = computed(() => eventBusStore.currentPlugin);
const router = useRouter();

const avatarUrl = new URL("@/assets/images/avatar.gif", import.meta.url).href;
const settingStore = useSettingStore();
const currentWindow = getCurrentWindow();
const searchText = ref("");

function handleAvatarClick() {
  eventBusStore.currentPlugin = {
    label: "个人中心",
  };
  router.push({ name: "pluginManage" });
  setWindowSize();
}
//插件数据
const plugins = ref(pluginData);

const handleSearch = (query: any) => {
  searchText.value = query;
  if (!query) {
    nextTick(() => {
      adjustWindowSize();
    });
    return;
  }

  nextTick(() => {
    // 确保在 DOM 更新后调整窗口大小
    adjustWindowSize();
  });
};

async function initWindow() {
  eventBusStore.pluginLoading = false;

  settingStore.transparent = false;
  await currentWindow.setFullscreen(false);
  await setWindowSize(800, 220);
  await currentWindow.setAlwaysOnTop(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  // const appElement = document.getElementById("app");
  currentWindow.emit("theme-changed");
  await adjustWindowSize();
}

initWindow();

onActivated(() => {
  initWindow();
});
</script>

<style lang="scss" scoped>
.plugin-search-header-bar {
  height: 35px;
  min-height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  padding: 10px 0 0 0;
  // border-bottom: 1px solid #F5F5F5;

  .plugin-search-header-bar-left {
    height: 100%;
    width: calc(100% - 60px);
    display: flex;
    align-items: center;
    justify-content: start;
  }

  .plugin-search-header-bar-right {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 22px;

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 35px;
      cursor: pointer;
    }

    .setting {
      font-size: 25px;
      cursor: pointer;
    }
  }

  .plugin-search-header-bar-search {
    height: 100%;

    :deep(.el-input__wrapper) {
      padding-left: 5px;
      border-radius: 0 !important;
      box-shadow: none;
      background: transparent;

      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}

.plugin-list-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: fit-content;

  .plugin-wrap {
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      padding-left: 12px;
    }

    .plugin-list {
      display: flex;
      justify-content: start;
      flex-wrap: wrap;
      min-height: 90px;
    }
  }

  .plugin-item {
    width: 86px;
    height: 86px;
    border-radius: 9px;
    margin: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: all 0.3s linear;
    cursor: pointer;

    .svg-icon {
      font-size: 40px;
      margin-bottom: 8px;
    }

    .plugin-item-title {
      font-size: 14px;
    }

    &:hover,
    &:active {
      background: #e1e5e7;
    }
  }

  .best-match {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
  }
}

.loading {
  display: none !important;
}

.loading-spinner {
  height: 100%;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-loading-spinner) {
  height: 100%;
  right: 0px !important;
  margin-top: -16px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.circular) {
  height: 37px;
  width: 37px;
}

.plugin-name {
  height: 32px;
  font-size: 18px;
  padding-right: 15px;
  padding-left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  // background-color: var(--el-color-primary);
  color: black;
  font-weight: bold;
  border: none;

  :deep(.el-tag__content) {
    margin-bottom: 4px;
  }

  :deep(.el-tag__close) {
    width: 20px;
    height: 20px;
    font-size: 20px;
    margin-bottom: 2px;
  }

  .plugin-close {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
