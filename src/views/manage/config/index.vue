<template>
  <div class="manage-page-main">
    <el-form :model="settingStore" ref="formRef" label-width="110px">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="使用偏好" name="1">
          <el-form-item label="呼出快捷键">
            <ShortcutInput v-model="settingStore.shortCutKey" />
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="数据存储" name="2">
          <el-form-item label="数据存储路径">
            <el-input v-model="settingStore.savePath">
              <template #append><span style="cursor: pointer" @click="selectFile('save')">选择</span></template>
            </el-input>
          </el-form-item>
          <el-form-item label="数据备份路径">
            <el-input v-model="settingStore.backupPath">
              <template #append><span style="cursor: pointer" @click="selectFile('backup')">选择</span></template>
            </el-input>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="高级设置" name="3">
          <el-form-item label="开机启动">
            <el-switch v-model="settingStore.autoStart" active-value="true" inactive-value="false" />
          </el-form-item>
          <el-form-item label="分离窗口快捷键">
            <ShortcutInput v-model="settingStore.separateWindowShortCutKey" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { openFileDialog } from "@/utils/file.ts";
import { ElNotification } from "element-plus";
import { useSettingStore } from "@/store/modules/setting.ts";
import ShortcutInput from "@/components/shortcut/shortcutInput.vue";
const activeNames = ref(["1", "2", "3"]);
const settingStore = useSettingStore();
const selectFile = async (type: string) => {
  const selectPath = await openFileDialog({ directory: true });
  if (!selectPath) {
    ElNotification.error("未获取到文件夹");
    return;
  }
  if (type === "save") {
    settingStore.savePath = selectPath;
  } else if (type === "backup") {
    settingStore.backupPath = selectPath;
  }
};
</script>
<style scoped lang="scss">
.manage-page-main {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  padding: 20px;
}
</style>
