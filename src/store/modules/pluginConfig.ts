/*
 * @Description:插件配置管理
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
import { pluginData } from "../../utils/plugin";

// 插件配置接口
interface PluginConfig {
  pluginId: string;
  settings: Record<string, any>;
}

export const usePluginConfigStore = defineStore("pluginConfig", () => {
  // 插件配置列表
  const pluginConfigs = ref<PluginConfig[]>([]);

  // --- 核心操作：设置插件配置 ---
  const setPluginConfig = (config: PluginConfig) => {
    console.log("设置插件配置", config);
    const index = pluginConfigs.value.findIndex((c) => c.pluginId == config.pluginId);
    if (index > -1) {
      pluginConfigs.value[index] = config;
    } else {
      pluginConfigs.value.push(config);
    }
    // 保存到本地
    saveStore();
  };

  // --- 核心操作：获取插件配置 ---
  const getPluginConfig = (pluginId: string): PluginConfig | undefined => {
    return pluginConfigs.value.find((c) => c.pluginId == pluginId);
  };

  // --- 核心操作：删除插件配置 ---
  const removePluginConfig = (pluginId: string) => {
    const index = pluginConfigs.value.findIndex((c) => c.pluginId == pluginId);
    if (index > -1) {
      pluginConfigs.value.splice(index, 1);
      // 保存到本地
      saveStore();
    }
  };

  // --- 核心操作：重置插件配置 ---
  const resetPluginConfig = (pluginId: string) => {
    const defaultConfig: PluginConfig = {
      pluginId,
      settings: {},
    };
    setPluginConfig(defaultConfig);
  };

  // --- 核心操作：保存到本地 ---
  const saveStore = () => {
    saveStoreData("pluginConfig", {
      pluginConfigs: pluginConfigs.value,
    });
  };

  // --- 核心操作：从本地加载 ---setPluginConfig
  const loadStore = async () => {
    const storeData = (await getStoreData("pluginConfig")) || {};
    pluginConfigs.value = storeData.pluginConfigs || [];
    if (pluginConfigs.value.length == 0) {
      resetPluginConfigs();
      saveStore();
    }
  };

  const resetPluginConfigs = () => {
    pluginConfigs.value = [];
    pluginData.forEach((plugin: any) => {
      pluginConfigs.value.push({
        pluginId: plugin.id,
        settings: { enabled: true, name: plugin.name || plugin.id, ...(plugin.meta || {}) },
      });
    });
  };

  return {
    pluginConfigs,
    setPluginConfig,
    getPluginConfig,
    removePluginConfig,
    resetPluginConfig,
    saveStore,
    loadStore,
  };
});
