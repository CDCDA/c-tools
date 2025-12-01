<template>
  <div class="manage-page-main ai-model-manage">
    <div class="ai-model-tip">
      <div class="tip">
        <div class="tip-line">在此添加AI模型</div>
        <div class="tip-line">需先到对应模型的官网申请密钥</div>
      </div>
      <el-button class="tip-btn" type="primary" @click="handleAdd">添加</el-button>
    </div>
    <div class="ai-model-list">
      <el-table :data="aiModelList" border>
        <el-table-column prop="modelName" label="模型名称" align="center" width="100px" show-overflow-tooltip />
        <el-table-column prop="modelId" label="模型ID" align="center" width="150px" show-overflow-tooltip />
        <el-table-column prop="baseUrl" label="API地址" align="center" width="150px" show-overflow-tooltip />
        <el-table-column prop="apiKey" label="API密钥" align="center" width="150px" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="120px" fixed="right">
          <template #default="scope">
            <el-button type="text" style="color: #409eff" @click="handleEdit(scope.row)" text size="mini"
              >编辑</el-button
            >
            <el-button type="text" style="color: #ff4d4f" @click="handleDelete(scope.row)" text size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AiModelDrawer ref="aiModelDrawerRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { useAiStore } from "@/store/modules/ai.ts";
import AiModelDrawer from "./components/aiModelDrawer.vue";

const aiStore = useAiStore();
const aiModelList = computed(() => aiStore.modelList);
const aiModelDrawerRef = ref(null) as any;
function handleAdd() {
  aiModelDrawerRef.value?.init({
    action: "add",
    aiModel: {},
  });
}
const handleEdit = (row: any) => {
  aiModelDrawerRef.value?.init({
    aiModel: row,
    action: "edit",
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确定删除AI模型吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    aiStore.removeModel(row);
  });
};
</script>
<style scoped lang="scss">
.manage-page-main {
  width: 100%;
  height: 100%;
  .ai-model-tip {
    margin: 15px;
    border-radius: 4px;
    background: white;
    height: 80px;
    display: flex;
    align-items: center;
    border: 1px solid #d5d7dd;
    background: linear-gradient(90deg, #f5f7fa 0%, #e4e7ed 100%);

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
  .ai-model-list {
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
      // margin: 10px;
      height: 100%;
      width: calc(100% - 0px);
    }
  }
}
</style>
