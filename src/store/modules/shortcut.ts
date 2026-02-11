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
import router from "@/router/index.ts";
import { executeScript } from "../../utils/shellExecutor";
import { getPluginData } from "@/utils/localSave.ts";

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
  const handleShortcutExecute = async (item: ShortcutItem) => {
    console.log("执行快捷键动作:", item);
    const currentWindow = getCurrentWindow();

    switch (item.type) {
      case "plugin":
        // 插件类型：跳转路由或激活插件
        selectPlugin(item, router);
        break;
      case "command":
        const shellData = await getPluginData("shell_pro");
        // 1. 获取所有脚本数据
        const script = shellData?.scripts?.find((s: any) => s.id === item.payload.scriptId);
        if (!script) return;

        // 2. 判断是否有参数
        if (script.args && script.args.length > 0) {
          currentWindow.show();
          currentWindow.setFocus();
          // 有参数：显示全局参数弹窗，不跳转页面
          bus.emit("show-global-param-dialog", script);
        } else {
          // 无参数：直接静默执行
          executeScript(script, {});
        }
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
          case "global-personal-center":
            router.push({ name: "account" });
            break;
          case "global-plugin-manager":
            router.push({ name: "pluginManage" });
            break;
        }
        break;
    }
  };

  // --- 改进：统一的物理注册，增加安全性 ---
  const registerSingle = (item: ShortcutItem) => {
    // 1. 如果没开启或快捷键为空，确保它是注销状态
    if (!item.shortcut || !item.enabled) {
      unRegisterShortcut(item);
      return;
    }

    // 2. 关键：注册前先尝试注销，防止重复绑定
    unRegisterShortcut(item);

    const registerItem = {
      ...item,
      event: () => {
        handleShortcutExecute(item);
      },
    };
    registerShortcut(registerItem);
  };

  const setShortcut = (item: ShortcutItem) => {
    const index = shortcuts.value.findIndex((s) => s.id === item.id);

    if (index > -1) {
      // 无论快捷键字符串是否变化，都先注销旧配置对应的物理按键
      unRegisterShortcut(shortcuts.value[index]);
      shortcuts.value[index] = item;
    } else {
      shortcuts.value.push(item);
    }

    // 执行新配置的物理注册
    registerSingle(item);
    saveStore();
  };

  // --- 改进：registerAll 增加清理动作 ---
  const registerAll = async () => {
    // 先全部注销，防止内存堆积
    await unRegisterAll();
    setTimeout(() => {
      shortcuts.value.forEach((item) => {
        if (item.enabled) {
          registerSingle(item);
        }
      });
    }, 500);
  };

  // --- 核心操作：注销所有快捷键 ---
  const unRegisterAll = () => {
    console.log("注销所有快捷键", shortcuts.value);
    shortcuts.value.forEach((item) => {
      unRegisterShortcut(item);
    });
  };

  const initShortcutConfig = () => {
    console.log("初始化插件快捷键列表", pluginData);
    const pluginShortcuts = pluginData.map((plugin: any) => ({
      id: plugin.id,
      name: plugin.name,
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
        shortcut: "Alt+Shift+C",
        enabled: true,
        type: "global",
      },
      {
        id: "global-personal-center",
        label: "个人中心",
        shortcut: "Alt+Shift+A",
        enabled: true,
        type: "global",
      },
      {
        id: "global-plugin-manager",
        label: "插件管理",
        shortcut: "Alt+Shift+S",
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
      saveStore();
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
  const getGlobalShortcutList = () => {
    return shortcuts.value.filter((item) => item.type === "global");
  };

  const getPluginShortcutList = () => {
    return shortcuts.value.filter((item) => item.type === "plugin");
  };

  const getCommandShortcutList = () => {
    return shortcuts.value.filter((item) => item.type === "command");
  };
  return {
    shortcuts,
    getGlobalShortcutList,
    getPluginShortcutList,
    getCommandShortcutList,
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
