<template>
  <div class="plugin-container">
    <!-- 独立窗口 头部 -->
    <PluginHeader :plugin="plugin" v-if="headerType === 'window' && plugin?.showHeader" />
    <!-- 主应用 头部 -->
    <PluginBar :plugin="plugin" v-if="headerType === 'main' && plugin?.showHeader" @pluginSearch="pluginSearch" />
    <div class="plugin-main" :class="loading ? 'loading' : ''">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { getPluginByName } from "@/utils/plugin.ts";
import PluginBar from "./components/pluginBar.vue";
import PluginHeader from "./components/pluginHeader.vue";
import { useEventBusStore } from "@/store/modules/eventBus.ts";
const eventBusStore = useEventBusStore();
const loading = computed(() => eventBusStore.pluginLoading);
const route = useRoute();
const plugin = ref({}) as any;
const headerType = ref("") as any;
watch(
  () => route,
  () => {
    console.log("新路由query参数:", route);
    plugin.value = getPluginByName(route.name);
    const { type } = route.query;
    if (type === "main") {
      headerType.value = "main";
    } else {
      headerType.value = "window";
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

function pluginSearch(val: string) {
  console.log("搜索:", val);
}
</script>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .plugin-main {
    flex: 1;
    overflow: auto;
  }
  .loading {
    height: 0 !important;
  }
}
</style>
