<template>
  <div class="plugin-bar" data-tauri-drag-region>
    <div class="plugin-bar-left" data-tauri-drag-region>
      <el-tag class="plugin-name" effect="dark" round closable type="info" @close="close">{{ plugin.label }}</el-tag>
    </div>
    <div class="plugin-bar-center" data-tauri-drag-region>
      <el-input class="plugin-bar-search" v-model="searchText" data-tauri-drag-region v-prevent-drag
        v-if="props.plugin.meta.search" @keyup.enter="handleSearch()" placeholder="请输入关键字" />
    </div>
    <div class="plugin-bar-right" data-tauri-drag-region>
      <el-dropdown @command="handleCommand">
        <el-icon class="setting">
          <Setting data-tauri-drag-region />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="window">分离为独立窗口</el-dropdown-item>
            <el-dropdown-item command="exit">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingStore } from "@/store/modules/setting.ts";
import { createNewWindow } from "@/utils/plugin.ts";
import { useRouter } from "vue-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { vPreventDrag } from "@/directive/preventDrag.ts"
import { bus } from "@/utils/bus.ts";
const currentWindow = getCurrentWindow();
const router = useRouter();
import { Setting } from "@element-plus/icons-vue";
const props = defineProps({
  plugin: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["pluginSearch"]);
const searchText = ref("");

const close = () => {
  router.push({ name: "pluginSearch" });
};

const handleCommand = async (command: string) => {
  switch (command) {
    case "window":
      router.push({ name: "pluginSearch" });
      currentWindow.hide();
      await createNewWindow(props.plugin, router);
      break;
    case "exit":
      router.push({ name: "pluginSearch" });
      break;
  }
};


function handleSearch() {
  emit("pluginSearch", searchText.value)
}

onMounted(() => {
  bus.on('separate-plugin-window', (data) => {
    handleCommand('window');
  });
});

onUnmounted(() => {
  bus.off('separate-plugin-window'); // 记得解绑
});


</script>

<style lang="scss" scoped>
.plugin-bar {
  height: 45px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  border-bottom: 1px solid #d5d7dd;

  i {
    outline: none !important;
  }

  .plugin-bar-left {
    height: 100%;
    margin: 0 20px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;

    .plugin-name {
      height: 32px;
      font-size: 18px;
      padding-right: 15px;
      padding-left: 20px;
      background-color: var(--el-color-primary);
      color: #fff;
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
  }

  .plugin-bar-center {
    flex: 1;
  }

  .plugin-bar-right {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;

    .setting {
      font-size: 25px;
      cursor: pointer;
    }
  }

  .plugin-bar-search {
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
