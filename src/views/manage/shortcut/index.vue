<template>
  <div class="manage-page-main short-cut-key-manage">
    <!-- <el-button type="danger" size="mini" @click="handleUnregisterAllClick"> 取消所有快捷键 </el-button> -->
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="插件" name="plugin">
        <el-button type="primary" size="mini" @click="handleRegisterAll" style="margin-bottom: 15px">
          注册所有快捷键
        </el-button>
        <el-button type="primary" size="mini" @click="handleUnRegisterAll" style="margin-bottom: 15px">
          卸载所有快捷键
        </el-button>
        <el-button type="danger" size="mini" @click="handleResetPlugin" style="margin-bottom: 15px">
          重置为默认
        </el-button>
        <el-table border :data="pluginShortcutList" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="55" />
          <el-table-column prop="label" label="插件名称" align="center" />
          <el-table-column prop="shortcut" label="快捷键" align="center">
            <template #default="scope">
              <ShortcutInput v-model="scope.row.shortcut"
                :check-duplicate="(shortcut: any) => checkShortcutDuplicate(shortcut, scope.row)"
                @change="handleShortcutChange(scope.row, 'plugin')" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleResetClick(scope.row, 'plugin')"> 重置 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="全局" name="global">
        <el-table border :data="globalShortcutList" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="55" />
          <el-table-column prop="label" label="功能名称" align="center" />
          <el-table-column prop="shortcut" label="快捷键" align="center">
            <template #default="scope">
              <ShortcutInput v-model="scope.row.shortcut"
                :check-duplicate="(shortcut: any) => checkShortcutDuplicate(shortcut, scope.row)"
                @change="handleShortcutChange(scope.row, 'global')" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleResetClick(scope.row, 'global')"> 重置 </el-button>
              <el-button type="text" size="mini" style="color: #ff4d4f" @click="handleDeleteClick(scope.row, 'global')">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="指令" name="command">
        <el-table border :data="commandShortcutList" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="55" />
          <el-table-column prop="label" label="指令名称" align="center" />
          <el-table-column prop="shortcut" label="快捷键" align="center">
            <template #default="scope">
              <ShortcutInput v-model="scope.row.shortcut"
                :check-duplicate="(shortcut: any) => checkShortcutDuplicate(shortcut, scope.row)"
                @change="handleShortcutChange(scope.row, 'command')" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleResetClick(scope.row, 'command')"> 重置 </el-button>
              <el-button type="text" size="mini" style="color: #ff4d4f"
                @click="handleDeleteClick(scope.row, 'command')">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElNotification } from "element-plus";
import ShortcutInput from "@/components/shortcut/shortcutInput.vue";
import { useShortcutStore } from "@/store/modules/shortcut.ts";
import { useRouter } from "vue-router";

const activeTab = ref("plugin");
const shortcutStore = useShortcutStore();
const router = useRouter();

// 计算属性
const pluginShortcutList = computed(() => shortcutStore.pluginShortcutList);
const globalShortcutList = computed(() => shortcutStore.globalShortcutList);
const commandShortcutList = computed(() => shortcutStore.commandShortcutList);

// 检查快捷键是否重复
function checkShortcutDuplicate(shortcut: string, currentItem: any): boolean {
  if (!shortcut) return false;

  const result = shortcutStore.checkShortcutDuplicate(shortcut, currentItem.id);
  if (result.isDuplicate && result.duplicateItem) {
    ElNotification.error(`快捷键已存在，与"${result.duplicateItem.label}"功能重复`);
  }
  return result.isDuplicate;
}

// 处理快捷键变化
function handleShortcutChange(item: any, type: string) {
  saveShortcut(item, type);
}

// 注册所有快捷键
async function handleRegisterAll() {
  try {
    await shortcutStore.registerAll();
    ElNotification.success("所有快捷键已注册");
  } catch (error) {
    ElNotification.error("注册快捷键时出错");
  }
}

// 卸载所有快捷键
async function handleUnRegisterAll() {
  try {
    await shortcutStore.unRegisterAll();
    ElNotification.success("所有快捷键已卸载");
  } catch (error) {
    ElNotification.error("卸载快捷键时出错");
  }
}

function handleResetPlugin() {
  shortcutStore.resetPluginShortcuts(router);
  ElNotification.success("所有快捷键已重置为默认");
}

// function handleSaveShortcuts(item: any) {
//   shortcutStore.updatePluginShortcut(item);
//   ElNotification.success("全局快捷键设置成功");
// }

// 保存快捷键
function saveShortcut(item: any, type: string) {
  if (type === "plugin") {
    shortcutStore.updatePluginShortcut(item);
  } else if (type === "global") {
    shortcutStore.updateGlobalShortcut(item);
  } else if (type === "command") {
    shortcutStore.updateCommandShortcut(item);
  }
  console.log("保存", item);
  shortcutStore.saveStore();
  // ElNotification.success("快捷键设置成功");
}

// 重置快捷键
function handleResetClick(item: any, type: string) {
  item.shortcut = "";
  saveShortcut(item, type);
}

// 删除快捷键
function handleDeleteClick(item: any, type: string) {
  item.shortcut = "";
  saveShortcut(item, type);
  ElNotification.success("快捷键已删除");
}
</script>

<style scoped lang="scss">
.short-cut-key-manage {
  width: 100%;
  height: 100%;

  .el-tabs {
    border: none;
    height: 100%;

    :deep(.el-tab-pane) {
      height: calc(100% - 5px);
    }
  }

  .el-table {
    height: calc(100% - 45px);
  }
}
</style>
