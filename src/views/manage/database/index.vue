<template>
  <div class="manage-page-main database-model-manage">
    <div class="database-model-tip">
      <div class="tip">
        <div class="tip-line">在此添加数据库</div>
        <div class="tip-line">目前支持mysql和pg</div>
      </div>
      <el-button class="tip-btn" type="primary" @click="handleAdd"
        >添加</el-button
      >
    </div>
    <div class="database-model-list">
      <el-table :data="databaseList" border>
        <el-table-column
          prop="name"
          label="数据库名称"
          align="center"
          width="auto"
          show-overflow-tooltip
        />
        <el-table-column
          prop="url"
          label="数据库URL"
          align="center"
          width="auto"
          show-overflow-tooltip
        />
        <el-table-column
          label="操作"
          align="center"
          width="120px"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="text"
              style="color: #409eff"
              @click="handleEdit(scope.row)"
              text
              size="mini"
              >编辑</el-button
            >
            <el-button
              type="text"
              style="color: #ff4d4f"
              @click="handleDelete(scope.row)"
              text
              size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <DatabaseDrawer ref="databaseDrawerRef" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { useDatabaseStore } from "@/store/modules/database.ts";
import DatabaseDrawer from "./components/databaseDrawer.vue";
const databaseStore = useDatabaseStore();
const databaseDrawerRef = ref(null) as any;
const databaseList = computed(() => databaseStore.databaseList);
const handleEdit = (row: any) => {
  databaseDrawerRef.value?.init({
    database: row,
    action: "edit",
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确定删除数据库连接吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    databaseStore.removeDatabase(row);
  });
};

function handleAdd() {
  databaseDrawerRef.value?.init({
    database: {
      name: "",
      url: "",
      connectType: "host",
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
      type: "postgresql",
    },
    action: "add",
  });
}

onMounted(() => {
  databaseStore.init();
});
</script>
<style scoped lang="scss">
.manage-page-main {
  width: 100%;
  height: 100%;

  .database-model-tip {
    margin: 15px;
    border-radius: 4px;
    background: white;
    height: 80px;
    width: calc(100% - 32px);
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, #f5f7fa 0%, #e4e7ed 100%);
    border: 1px solid #ebebeb;

    .tip {
      display: flex;
      align-items: start;
      flex-direction: column;
      justify-content: center;
      width: 80%;
      height: 100%;
      padding: 0 20px;
    }
  }

  .database-model-list {
    width: calc(100% - 30px);
    height: calc(100% - 135px);
    margin: 15px;
    border-radius: 4px;
    overflow: hidden;
    background: white;

    .el-button {
      margin: 0 5px;
      padding: 0;
    }

    .el-table {
      border-radius: 4px;
      height: 100%;
      // margin: 10px;
      width: calc(100% - 0px);
    }
  }
}
</style>
