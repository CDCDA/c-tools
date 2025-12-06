/*
 * @Description:AI模型数据
 */
import { pluginData, selectPlugin } from "@/utils/plugin.ts";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
import { defineStore } from "pinia";
import { ref } from "vue";
import { registerShortcut, unRegisterShortcut } from "@/utils/shortcut.ts";

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
      const index = pluginShortcutList.value.findIndex((item: any) => item.name === pluginShortcut.name);
      if (index !== -1) {
        pluginShortcutList.value[index] = pluginShortcut;
      }
    };
    const updateCommandShortcut = (commandShortcut: any) => {
      const index = commandShortcutList.value.findIndex((item: any) => item.name === commandShortcut.name);
      if (index !== -1) {
        commandShortcutList.value[index] = commandShortcut;
      }
    };
    const updateGlobalShortcut = (globalShortcut: any) => {
      const index = globalShortcutList.value.findIndex((item: any) => item.name === globalShortcut.name);
      if (index !== -1) {
        globalShortcutList.value[index] = globalShortcut;
      }
    };

    const resetPluginShortcuts = (router: any) => {
      // 初始化插件快捷键列表
      pluginShortcutList.value = pluginData;
      saveStore();
      registerAll(router);
    };

    const saveStore = () => {
      saveStoreData("shortcut", {
        pluginShortcutList: pluginShortcutList.value,
        globalShortcutList: globalShortcutList.value,
        commandShortcutList: commandShortcutList.value,
      });
    };

    const loadStore = async (router: any) => {
      const storeData = (await getStoreData("shortcut")) || {};
      pluginShortcutList.value = storeData.pluginShortcutList || [];
      globalShortcutList.value = storeData.globalShortcutList || [];
      commandShortcutList.value = storeData.commandShortcutList || [];
      if (pluginShortcutList.value.length === 0) {
        // 初始化插件快捷键列表
        pluginShortcutList.value = [...pluginData];
      }
      registerAll(router);
    };

    const registerAll = async (router: any) => {
      console.log("开始注册快捷键", pluginShortcutList.value);
      for (const item of pluginShortcutList.value) {
        item.event = () => {
          selectPlugin(item, router);
        };
        registerShortcut(item);
      }
    };
    const unRegisterAll = async () => {
      for (const item of pluginShortcutList.value) {
        unRegisterShortcut(item);
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
      registerAll,
      unRegisterAll,
      resetPluginShortcuts,
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export { useShortcutStore };
