/*
 * @Description:快捷键管理
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { registerShortcut, unRegisterShortcut } from "@/utils/shortcut.ts";
import { selectPlugin } from "@/utils/plugin.ts";
import { pluginData } from "@/utils/plugin.ts";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
import { bus } from "@/utils/bus.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useRouter } from "vue-router";
import { getPluginByName } from "../../utils/plugin";
import router from "@/router/index.ts";

// 快捷键项接口
interface ShortcutItem {
  id: string;
  label: string;
  shortcut: string;
  enabled: boolean;
  type: "plugin" | "command" | "global";
  payload?: any;
}

export const useShortcutStore = defineStore("shortcut", () => {
  // 所有的快捷键都统一管理
  const shortcuts = ref<ShortcutItem[]>([]);

  // --- 核心操作：统一的增删改 ---
  const setShortcut = (item: ShortcutItem) => {
    const index = shortcuts.value.findIndex((s) => s.id === item.id);
    if (index > -1) {
      // 如果快捷键变化了，先注销旧的
      if (shortcuts.value[index].shortcut !== item.shortcut) {
        unRegisterShortcut(shortcuts.value[index]);
      }
      shortcuts.value[index] = item;
    } else {
      shortcuts.value.push(item);
    }
    // 执行物理注册
    registerSingle(item);
    // 保存到本地
    saveStore();
  };

  // --- 核心操作：删除快捷键 ---
  const removeShortcut = (id: string) => {
    const index = shortcuts.value.findIndex((s) => s.id === id);
    if (index > -1) {
      // 注销快捷键
      unRegisterShortcut(shortcuts.value[index]);
      // 从数组中删除
      shortcuts.value.splice(index, 1);
      // 保存到本地
      saveStore();
    }
  };

  // --- 核心操作：分发器 (解决持久化不能存函数的问题) ---
  const handleShortcutExecute = (item: ShortcutItem) => {
    console.log("执行快捷键动作:", item.id);
    const currentWindow = getCurrentWindow();

    switch (item.type) {
      case "plugin":
        // 插件类型：跳转路由或激活插件
        selectPlugin(item, router);
        break;
      case "command":
        const plugin = getPluginByName("shell");
        selectPlugin(plugin, router);
        // 指令类型：比如 shell 脚本
        bus.emit("execute-plugin-action", {
          pluginId: "shell",
          actionId: item.payload.scriptId,
        });
        break;
      case "global":
        // 全局类型：如显示/隐藏窗口
        switch (item.id) {
          case "global-show-hide":
            if (!currentWindow || currentWindow.label !== "main") return;
            // 显示主窗口
            currentWindow.show();
            currentWindow.unminimize();
            currentWindow.setFocus();
            break;
          case "global-separate-window":
            console.log("global-separate-window");
            // 分离当前窗口为独立窗口
            bus.emit("separate-plugin-window");
            break;
        }
        break;
    }
  };

  // --- 核心操作：物理注册 ---
  const registerSingle = (item: ShortcutItem) => {
    if (!item.shortcut || !item.enabled) return;

    // 重新封装 event，不存入 state，只在注册时动态绑定
    const registerItem = {
      ...item,
      event: () => {
        handleShortcutExecute(item);
      },
    };
    registerShortcut(registerItem);
  };

  // --- 核心操作：注册所有快捷键 ---
  const registerAll = () => {
    console.log("开始注册所有快捷键", shortcuts.value);
    shortcuts.value.forEach((item) => {
      registerSingle(item);
    });
  };

  // --- 核心操作：注销所有快捷键 ---
  const unRegisterAll = () => {
    shortcuts.value.forEach((item) => {
      unRegisterShortcut(item);
    });
  };

  const initShortcutConfig = () => {
    console.log("初始化插件快捷键列表");
    const pluginShortcuts = pluginData.map((plugin: any) => ({
      id: plugin.name,
      label: plugin.label,
      shortcut: plugin.shortcut,
      enabled: true,
      type: "plugin",
    }));
    const globalShortcuts = [
      {
        id: "global-show-hide",
        label: "显示/隐藏窗口",
        shortcut: "Alt+Space",
        enabled: true,
        type: "global",
      },
      {
        id: "global-separate-window",
        label: "分离为独立窗口",
        shortcut: "Alt+Shift+c",
        enabled: true,
        type: "global",
      },
    ];
    shortcuts.value = [...pluginShortcuts, ...globalShortcuts];
  };

  // --- 核心操作：重置插件快捷键 ---
  const resetPluginShortcuts = async () => {
    // 先注销所有现有快捷键
    unRegisterAll();
    // 初始化插件快捷键列表
    await initShortcutConfig();
    // 保存并重新注册
    saveStore();
    registerAll();
  };

  // --- 核心操作：保存到本地 ---
  const saveStore = () => {
    saveStoreData("shortcut", {
      shortcuts: shortcuts.value,
    });
  };

  // --- 核心操作：从本地加载 ---
  const loadStore = async () => {
    const storeData = (await getStoreData("shortcut")) || {};
    shortcuts.value = storeData.shortcuts || [];

    if (shortcuts.value.length === 0) {
      // 初始化插件快捷键列表
      initShortcutConfig();
    }

    // 注册所有快捷键
    registerAll();
  };

  // --- 核心操作：校验快捷键是否重复 ---
  const checkShortcutDuplicate = (
    shortcut: string,
    excludeId?: string,
  ): { isDuplicate: boolean; duplicateItem?: ShortcutItem } => {
    const duplicateItem = shortcuts.value.find((item) => {
      return item.shortcut === shortcut && item.id !== excludeId;
    });

    return {
      isDuplicate: !!duplicateItem,
      duplicateItem,
    };
  };

  return {
    shortcuts,
    setShortcut,
    removeShortcut,
    registerAll,
    unRegisterAll,
    resetPluginShortcuts,
    saveStore,
    loadStore,
    handleShortcutExecute,
    checkShortcutDuplicate,
  };
});

export type { ShortcutItem };
