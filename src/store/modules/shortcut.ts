/*
 * @Description:AI模型数据
 */
import { pluginData, getPluginByKey } from "../../views/plugins/plugins.ts";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
import { defineStore } from "pinia";
import { ref } from "vue";
import { registerShortcut } from "@/utils/shortcut.ts";
import { useEventBusStore } from "@/store/modules/eventBus.ts";

const useShortcutStore = defineStore(
  "shortcut",
  () => {
    // 插件快捷键列表
    const pluginShortcutList = ref([]) as any;
    const globalShortcutList = ref([]) as any;
    // 指令快捷键列表
    const commandShortcutList = ref([]) as any;
    const addCommandShortcut = (commandShortcut: any) => {
      commandShortcutList.value.push(commandShortcut);
    };
    const addPluginShortcut = (pluginShortcut: any) => {
      pluginShortcutList.value.push(pluginShortcut);
    };
    const addGlobalShortcut = (globalShortcut: any) => {
      globalShortcutList.value.push(globalShortcut);
    };

    const removePluginShortcut = (pluginShortcut: any) => {
      pluginShortcutList.value = pluginShortcutList.value.filter((item: any) => item !== pluginShortcut);
    };

    const removeGlobalShortcut = (globalShortcut: any) => {
      globalShortcutList.value = globalShortcutList.value.filter((item: any) => item !== globalShortcut);
    };
    const removeCommandShortcut = (commandShortcut: any) => {
      commandShortcutList.value = commandShortcutList.value.filter((item: any) => item !== commandShortcut);
    };

    const updatePluginShortcut = (pluginShortcut: any) => {
      const index = pluginShortcutList.value.findIndex((item: any) => item.id === pluginShortcut.id);
      if (index !== -1) {
        pluginShortcutList.value[index] = pluginShortcut;
      }
    };
    const updateCommandShortcut = (commandShortcut: any) => {
      const index = commandShortcutList.value.findIndex((item: any) => item.id === commandShortcut.id);
      if (index !== -1) {
        commandShortcutList.value[index] = commandShortcut;
      }
    };
    const updateGlobalShortcut = (globalShortcut: any) => {
      const index = globalShortcutList.value.findIndex((item: any) => item.id === globalShortcut.id);
      if (index !== -1) {
        globalShortcutList.value[index] = globalShortcut;
      }
    };

    const resetPluginShortcuts = () => {
      // 初始化插件快捷键列表
      pluginShortcutList.value = pluginData.map((item: any) => ({
        id: item.id,
        name: item.name,
        key: item.key,
        shortcut: item.defaultShortcut || "",
      }));
      initRegister();
    };

    const saveStore = () => {
      saveStoreData("shortcut", {
        pluginShortcutList: pluginShortcutList.value,
        globalShortcutList: globalShortcutList.value,
        commandShortcutList: commandShortcutList.value,
      });
    };

    const loadStore = async () => {
      const storeData = (await getStoreData("shortcut")) || {};
      pluginShortcutList.value = storeData.pluginShortcutList || [];
      globalShortcutList.value = storeData.globalShortcutList || [];
      commandShortcutList.value = storeData.commandShortcutList || [];
      if (pluginShortcutList.value.length === 0) {
        // 初始化插件快捷键列表
        pluginShortcutList.value = pluginData.map((item: any) => ({
          id: item.id,
          name: item.name,
          key: item.key,
          shortcut: item.defaultShortcut || "",
        }));
      }
      initRegister();
    };

    const initRegister = async () => {
      console.log("开始注册快捷键", pluginShortcutList.value);
      const eventBusStore = useEventBusStore();
      for (const item of pluginShortcutList.value) {
        item.event = async () => {
          eventBusStore.setCurrentPlugin(null);
          await new Promise((resolve) => setTimeout(resolve, 100));
          console.log("触发插件快捷键", item.key);
          const currentPlugin = getPluginByKey(item.key);
          eventBusStore.setCurrentPlugin(currentPlugin);
        };
        await registerShortcut(item);
      }
    };

    return {
      pluginShortcutList,
      globalShortcutList,
      commandShortcutList,
      addPluginShortcut,
      addGlobalShortcut,
      addCommandShortcut,
      removePluginShortcut,
      removeGlobalShortcut,
      removeCommandShortcut,
      updatePluginShortcut,
      updateGlobalShortcut,
      updateCommandShortcut,
      saveStore,
      loadStore,
      initRegister,
      resetPluginShortcuts,
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export { useShortcutStore };
