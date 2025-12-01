<template>
  <div class="manage-page-main">
    <div class="local-data-list">
      <el-table :data="localDataList" border>
        <el-table-column prop="name" label="名称" align="center" width="auto" show-overflow-tooltip>
          <template #default="scope">
            <svg-icon :iconName="scope.row.icon" class="plugin-icon" />
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="url" label="数据数量" align="center" width="auto" show-overflow-tooltip /> -->
        <el-table-column label="操作" align="center" width="150px" fixed="right">
          <template #default="scope">
            <el-button type="text" style="color: #409eff" @click="handleView(scope.row)" text size="mini"
              >查看</el-button
            >
            <el-button type="text" style="color: #ff4d4f" @click="handleClean(scope.row)" text size="mini"
              >格式化</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { list, openFolder, remove } from "@/utils/file.ts";
import { useSettingStore } from "@/store/modules/setting.ts";
import { getPluginByKey } from "../../plugins/plugins.ts";
const settingStore = useSettingStore();
const localDataList = ref([]) as any;
async function getLocalDataList() {
  const res = await list({
    // 遍历的文件夹路径
    path: settingStore.savePath,
    //最大遍历深度
    maxDepth: 5,
    // 排除的文件或文件夹，多个用逗号分隔
    excludeFiles: ".git,node_modules,target,.jar",
    includeFiles: ".json",
  });
  localDataList.value = res;
  const pluginList = res.find((item: any) => item.name === "plugins").children;
  pluginList.forEach((item: any) => {
    const plugin = getPluginByKey(item.name) as any;
    localDataList.value.push({
      icon: plugin.icon,
      name: plugin.name,
      dataPath: item.path + "\\index.json",
    });
  });
}

function handleView(row: any) {
  console.log("1111", row);
  openFolder(row.dataPath);
}
function handleClean(row: any) {
  remove(row.dataPath);
}

getLocalDataList();
</script>
<style scoped lang="scss">
.manage-page-main {
  height: calc(100% - 35px);
  width: calc(100% - 30px);
  padding: 15px;
  .el-table,
  .local-data-list {
    height: calc(100% - 0px);
  }
}
</style>
