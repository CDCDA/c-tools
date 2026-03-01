<!--
 * @Description: 插件配置页面
-->
<template>
  <div class="plugin-config-container">
    <div class="plugin-config-header">
      <div class="plugin-config-header-left">
        <svg-icon
          class="plugin-icon"
          :iconName="pluginConfig?.settings?.icon || 'plugin-icon'"
        />
      </div>
      <div class="plugin-config-header-right">
        <p class="plugin-config-title">
          {{ pluginConfig?.settings?.label || "插件配置" }}
        </p>
        <p class="plugin-config-desc">
          {{ pluginConfig?.settings?.description || "未设置简介" }}
        </p>
      </div>
    </div>

    <div class="plugin-config-content">
      <el-form :model="pluginConfig" label-width="6rem">
        <el-collapse v-model="activeCollapseNames">
          <el-collapse-item title="基础设置" name="1">
            <el-form-item label="快捷键">
              <ShortcutInput
                v-model="pluginConfig.settings.shortcut"
                :excludeId="pluginConfig.pluginId"
              />
            </el-form-item>
            <el-form-item label="是否启用">
              <el-switch v-model="pluginConfig.settings.enabled" />
            </el-form-item>
            <el-form-item label="本地数据">
              <el-input
                v-model="pluginConfig.settings.path"
                placeholder="本地数据路径"
                disabled
              >
                <template #append>
                  <el-button type="primary" size="mini" @click="openFileDialog"
                    >打开</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="备份数据">
              <el-input
                v-model="pluginConfig.settings.backPath"
                placeholder="备份数据路径"
                disabled
              >
                <template #append>
                  <el-button type="primary" size="mini" @click="openFileDialog"
                    >打开</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="高级配置" name="2">
            <el-form-item label="新窗口打开">
              <el-switch v-model="pluginConfig.settings.newWindow" />
            </el-form-item>
            <el-form-item label="默认置顶">
              <el-switch v-model="pluginConfig.settings.alwaysOnTop" />
            </el-form-item>
            <el-form-item label="默认全屏">
              <el-switch v-model="pluginConfig.settings.fullscreen" />
            </el-form-item>
            <el-form-item label="任务栏显示">
              <el-switch v-model="pluginConfig.settings.skipTaskbar" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>

    <div class="plugin-config-footer">
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePluginConfigStore } from "@/store/modules/pluginConfig.ts";
import { useShortcutStore } from "@/store/modules/shortcut.ts";
import ShortcutInput from "@/components/shortcut/shortcutInput.vue";
import { ElNotification } from "element-plus";
const route = useRoute();
const router = useRouter();
const pluginConfigStore = usePluginConfigStore();
const shortcutStore = useShortcutStore();

// 获取当前插件ID
const pluginId = computed(() => route.params.id as string);

// 插件配置
const pluginConfig = ref({
  pluginId: "",
  settings: {},
}) as any;

// 折叠面板状态，默认全部展开
const activeCollapseNames = ref(["1", "2", "3"]);
// 重置插件配置
const resetConfig = () => {
  pluginConfig.value.settings = {
    name: pluginId.value,
    label: pluginId.value,
    shortcut: "",
    enabled: true,
    newWindow: false,
    alwaysOnTop: false,
    fullscreen: false,
    skipTaskbar: false,
  };
};
// 加载插件信息
const loadPluginInfo = () => {
  let config = null as any;
  console.log("pluginId.value:", pluginConfigStore);
  if (pluginId.value) {
    config = pluginConfigStore.getPluginConfig(pluginId.value);
  } else {
    config = pluginConfigStore.pluginConfigs[0] || null;
  }
  console.log("找到的插件:", config);
  if (config) {
    pluginConfig.value = { ...config };
  } else {
    ElNotification.error("未找到指定插件的配置");
    router.push({ name: "pluginManage" });
  }
};
// 打开文件对话框
const openFileDialog = () => {
  // invoke("openFileDialog", {
  //   title: "选择文件",
  //   filter: [
  //     {
  //       name: "所有文件",
  //       extensions: ["*"],
  //     },
  //   ],
  // }).then((path) => {
  //   if (path) {
  //     pluginConfig.value.settings.path = path;
  //   }
  // });
};
// 保存插件配置
const saveConfig = () => {
  console.log("pluginConfig.value:", pluginConfig.value);
  if (pluginConfig.value.settings.shortcut) {
    shortcutStore.setShortcut({
      id: pluginConfig.value.pluginId,
      name: pluginConfig.value.settings.name,
      label: pluginConfig.value.settings.label || pluginId.value,
      shortcut: pluginConfig.value.settings.shortcut,
      enabled: true,
      type: "plugin",
      payload: pluginConfig.value.settings,
    });
  }
  pluginConfigStore.setPluginConfig(pluginConfig.value);
  ElNotification.success("插件配置已保存");
};

// 监听插件ID变化
watch(pluginId, () => {
  loadPluginInfo();
});

// 组件挂载时加载插件信息
onMounted(() => {
  loadPluginInfo();
});
</script>
<style lang="scss" scoped>
.plugin-config-container {
  padding: 15px;
  height: calc(100% - 30px);
  width: calc(100% - 30px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  .plugin-config-header {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .plugin-config-header-left {
      margin-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      .plugin-icon {
        font-size: 60px;
      }
    }

    .plugin-config-header-right {
      flex: 1;
    }

    .plugin-config-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 0px;
    }

    .plugin-config-desc {
      font-size: 14px;
      color: #606266;
      margin: 0;
      min-height: 40px;
      /* 最小高度设为两行 */
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    p {
      font-size: 14px;
      color: #606266;
      margin: 0;
    }
  }

  .plugin-config-content {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;

    .el-collapse {
      // border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;

      .el-collapse-item {
        // border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .el-collapse-item__header {
          background-color: #f5f7fa;
          font-weight: 500;
        }

        .el-collapse-item__content {
          padding: 20px;
          background-color: #ffffff;
        }
      }
    }
  }

  .plugin-config-footer {
    border-top: 1px solid #ebeef5;
    background-color: #ffffff;
    position: absolute;
    bottom: 0px;
    width: calc(100% - 20px);
    left: 0;
    text-align: right;
    padding: 10px;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>
