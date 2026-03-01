<template>
  <div class="plugin-bar" data-tauri-drag-region>
    <div class="plugin-bar-left" data-tauri-drag-region>
      <!-- <el-tag class="plugin-name" effect="dark" round closable type="info" @close="close"><svg-icon
          :iconName="plugin.meta.icon" style="margin-right: 5px;" />{{ plugin.label }}</el-tag> -->
      <div class="plugin-name">
        <svg-icon :iconName="plugin.meta.icon" style="margin-right: 5px" />
        <div style="margin-bottom: 2px">{{ plugin.label }}</div>
        <svg-icon
          iconName="otherSvg-关闭"
          style="cursor: pointer; margin-left: 5px; width: 22px; height: 22px"
          @click="close"
        />
      </div>
    </div>
    <div class="plugin-bar-center" data-tauri-drag-region>
      <svg-icon
        iconName="otherSvg-搜索"
        v-if="props.plugin.meta.search"
        style="margin-left: 20px; width: 23px; height: 23px"
      ></svg-icon>

      <el-input
        class="plugin-bar-search"
        v-model="searchText"
        data-tauri-drag-region
        v-prevent-drag
        v-if="props.plugin.meta.search"
        @keyup.enter="handleSearch()"
        placeholder="请输入关键字"
      />
    </div>
    <div class="plugin-bar-right" data-tauri-drag-region>
      <el-dropdown @command="handleCommand">
        <svg-icon
          iconName="otherSvg-设置"
          data-tauri-drag-region
          style="width: 23px; height: 23px"
        ></svg-icon>
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
import { ref, onMounted, onUnmounted } from "vue";
import { createNewWindow } from "@/utils/plugin.ts";
import { useRouter } from "vue-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { vPreventDrag } from "@/directive/preventDrag.ts";
import { bus } from "@/utils/bus.ts";
const currentWindow = getCurrentWindow();
const router = useRouter();
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
  emit("pluginSearch", searchText.value);
}

onMounted(() => {
  bus.on("separate-plugin-window", () => {
    handleCommand("window");
  });
});

onUnmounted(() => {
  bus.off("separate-plugin-window"); // 记得解绑
});
</script>

<style lang="scss" scoped>
.plugin-bar {
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  padding: 10px 0 0 0;
  // border-bottom: 1px solid #EBEBEB;

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
  }

  .plugin-bar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: start;
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
      padding-left: 5px;
      border-radius: 0 !important;
      box-shadow: none;
      background: transparent;

      .el-input__inner {
        font-size: 18px !important;
      }
    }
  }
}
</style>
