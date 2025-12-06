/*
 * @Description:事件总线数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
const useEventBusStore = defineStore(
  "eventBus",
  () => {
    const data = ref({}) as any;
    const currentPlugin = ref({}) as any;
    const pluginLoading = ref(false);
    const set = (key: string, value: any) => {
      data.value[key] = value;
    };
    const get = (key: string) => {
      return data.value[key];
    };
    const remove = (key: string) => {
      delete data.value[key];
    };
    const clear = () => {
      data.value = {};
    };
    const setCurrentPlugin = (plugin: any) => {
      currentPlugin.value = plugin;
    };
    const getCurrentPlugin = () => {
      return currentPlugin.value;
    };
    return {
      set,
      get,
      remove,
      clear,
      setCurrentPlugin,
      getCurrentPlugin,
      pluginLoading,
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export { useEventBusStore };
