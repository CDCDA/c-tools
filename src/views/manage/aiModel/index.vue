<template>
  <div class="manage-page-main ai-model-manage">
    <div class="ai-model-tip">
      <div class="tip">
        <div class="tip-line">在此添加AI模型</div>
        <div class="tip-line">需先到对应模型的官网申请密钥</div>
      </div>
      <el-button class="tip-btn">添加</el-button>
    </div>
    <div class="ai-model-list">
      <el-table :data="aiModelList" border @cell-dblclick="handleCellDoubleClick">
        <el-table-column prop="modelName" label="模型名称" align="center" width="100px" show-overflow-tooltip />
        <el-table-column prop="modelId" label="模型ID" align="center" width="150px" show-overflow-tooltip />
        <el-table-column prop="baseUrl" label="API地址" align="center" width="150px" show-overflow-tooltip />
        <el-table-column prop="apiKey" label="API密钥" align="center" width="150px" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="120px" fixed="right">
          <template #default="scope">
            <el-button type="primary" @click="handleEditClick(scope.row)" text size="mini">编辑</el-button>
            <el-button type="danger" @click="handleDeleteClick(scope.row)" text size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";
import { useAiStore } from "@/store/modules/ai";
const aiStore = useAiStore();
const aiModelList = ref([]) as any;

const handleEditClick = (row: any) => {
  console.log(row);
};

const handleDeleteClick = (row: any) => {
  console.log(row);
};

const handleCellDoubleClick = (row: any, column: any) => {
  // 1. 获取要复制的内容
  const valueToCopy = row[column.property];

  // 2. 检查内容是否存在，避免复制 null 或 undefined
  if (valueToCopy) {
    // 3. 使用现代的 Clipboard API 进行复制
    navigator.clipboard
      .writeText(valueToCopy)
      .then(() => {
        // 4. 复制成功后给用户一个友好的提示
        ElNotification({
          title: `${column.label} 复制成功`,
          type: "success",
        });
      })
      .catch((err) => {
        // 复制失败时的错误处理
        console.error("复制失败:", err);
        ElNotification({
          message: "复制失败，请稍后重试。",
          type: "error",
        });
      });
  } else {
    // 如果单元格内容为空，也可以给一个提示
    ElNotification({
      message: "单元格内容为空，无需复制。",
      type: "warning",
    });
  }
};

function init() {
  aiModelList.value = aiStore.modelList;
}

onMounted(() => {
  init();
});
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
      margin: 10px;
      width: calc(100% - 20px);
    }
  }
}
</style>
