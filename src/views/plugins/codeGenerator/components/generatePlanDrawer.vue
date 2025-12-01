<template>
  <el-drawer v-model="open" title="生成方案" size="50%" direction="rtl" @close="close">
    <div class="drawer-content">
      <div class="generator-list">
        <div class="tools">
          <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
          <el-button type="danger" size="mini" @click="handleDelete()" :disabled="selectedRows.length === 0"
            >删除</el-button
          >
        </div>
        <el-table
          :data="generatePlanList"
          style="width: 100%"
          border
          @row-dblclick="handleClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="生成方案名称" width="auto" align="center">
            <template #default="scope">
              {{ scope.row.name || "未命名" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="生成方案详情" v-model="dialogVisible" width="50%" @close="dialogVisible = false">
      <div class="dialog-content">
        <el-form :model="currentGeneratePlan" ref="formRef" :rules="rules" label-width="120px">
          <el-form-item label="生成方案名称" prop="name">
            <el-input v-model="currentGeneratePlan.name" placeholder="请输入生成方案名称" />
          </el-form-item>
          <el-form-item label="基础路径" prop="basePath">
            <el-input v-model="currentGeneratePlan.basePath" placeholder="请输入基础路径" />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref } from "vue";

const open = ref(false);
const emit = defineEmits(["getGeneratePlan", "update:generatePlanList"]);

const close = () => {
  open.value = false;
};

const dialogVisible = ref(false);

const currentGeneratePlan = ref({}) as any;

const rules = ref({
  name: [{ required: true, message: "请输入生成方案名称", trigger: ["blur"] }],
  basePath: [{ required: true, message: "请输入公共路径", trigger: ["blur"] }],
});

const init = (params: any) => {
  generatePlanList.value = params.generatePlanList;
  open.value = true;
};

const generatePlanList = ref([]) as any;

function handleClick(row: any) {
  emit("getGeneratePlan", row);
  close();
}

function handleAdd() {
  const generator = {
    id: randomIntFromInterval(1, 1000000000),
    name: "",
    content: "",
    filePlanList: [{}],
  };
  emit("getGeneratePlan", generator);
  open.value = false;
}

function handleEdit(row: any) {
  currentGeneratePlan.value = row;
  dialogVisible.value = true;
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const selectedRows = ref([]) as any;

function handleSelectionChange(val: any) {
  selectedRows.value = val;
}

function handleDelete(row?: any) {
  ElMessageBox.confirm("确定删除选中项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    if (row) {
      generatePlanList.value = generatePlanList.value.filter((item: any) => item.id !== row.id);
    } else {
      const ids = selectedRows.value.map((item: any) => item.id);
      generatePlanList.value = generatePlanList.value.filter((item: any) => !ids.includes(item.id));
    }
    emit("update:generatePlanList", generatePlanList.value);
    ElNotification.success("删除成功");
  });
}

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  .generator-list {
    height: calc(100% - 40px);
    .el-table {
      height: 100%;
    }
  }
  .tools {
    margin-bottom: 10px;
  }
}
</style>
