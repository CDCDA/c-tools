<template>
  <div class="generatePlan-plan part-container">
    <div class="part-header">
      <div class="part-title">
        <el-button type="text" size="mini" style="margin-bottom: -2px" @click="handleShowList">{{
          currentGeneratePlan.name || "未命名方案"
        }}</el-button>
      </div>
      <div class="part-tools">
        <el-tooltip content="新增生成方案" placement="top">
          <el-icon @click="handleAdd"><Plus /></el-icon>
        </el-tooltip>
        <el-tooltip content="保存为新方案" placement="top">
          <el-icon><DocumentAdd @click="handleSave" /></el-icon>
        </el-tooltip>
        <el-tooltip content="修改方案" placement="top">
          <el-icon v-if="currentGeneratePlan.id"><DocumentChecked @click="handleUpdate" /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="part-main generatePlan-table">
      <el-table
        ref="tableRef"
        border
        :data="currentGeneratePlan.filePlanList"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55" />
        <!-- <el-table-column type="index" align="center" label="序号" width="55" /> -->
        <el-table-column prop="planName" align="center" label="方案名称" width="150" />
        <el-table-column prop="suffix" align="center" label="后缀" width="80" />
        <el-table-column prop="language" align="center" label="语言" width="80" />
        <el-table-column align="center" label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button
              type="text"
              v-loading="testLoading && currentFilePlan.id === scope.row.id"
              size="mini"
              @click="handleTest(scope.row)"
              >测试</el-button
            >
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" style="color: #ff4d4f" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="part-footer">
      <div class="part-footer-left">
        <el-tooltip content="新增文件方案" placement="top">
          <el-icon @click="handleAddFilePlan"><Plus /></el-icon>
        </el-tooltip>
        <!-- <div class="part-footer-item" style="color: #979797">编辑具体的生成方案</div> -->
      </div>
      <div class="part-footer-right">
        <div class="part-footer-item">
          <span>共</span>
          <span :style="{ margin: '0px 5px 2px 5px', color: 'var(--el-color-primary)' }">{{
            currentGeneratePlan.filePlanList?.length || 0
          }}</span>
          <span>条数据</span>
        </div>
      </div>
    </div>
    <GeneratePlanDrawer
      ref="generatePlanDrawerRef"
      @getGeneratePlan="handleGetGeneratePlan"
      @update:generatePlanList="updateGeneratorList"
    />
    <FilePlanEditDrawer
      ref="filePlanEditDrawerRef"
      :currentFilePlan="currentFilePlan"
      @update:currentFilePlan="handleUpdateFilePlan"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DocumentAdd, DocumentChecked, Plus } from "@element-plus/icons-vue";
import { ElNotification, ElMessageBox } from "element-plus";
import GeneratePlanDrawer from "./generatePlanDrawer.vue";
import FilePlanEditDrawer from "./filePlanEditDrawer.vue";

const testLoading = ref(false);
const generatePlanList = ref([]) as any;
const props = defineProps({
  generatePlanList: {
    type: Array,
    default: [],
  },
  currentGeneratePlan: {
    type: Object,
    default: {},
  },
  selectedRows: {
    type: Array,
    default: [],
  },
});
// 当前选中的文件方案
const currentFilePlan = ref({}) as any;
// 当前选中的生成方案
const currentGeneratePlan = ref({
  id: null,
  name: "未命名",
  filePlanList: [],
}) as any;

const emit = defineEmits(["handleTest"]);

const filePlanEditDrawerRef = ref(null) as any;

const selectedRows = ref([]) as any;

function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

function handleGetGeneratePlan(row: any) {
  currentGeneratePlan.value = row;
}

const generatePlanDrawerRef = ref(null) as any;

function handleShowList() {
  generatePlanDrawerRef.value?.init({
    generatePlanList: generatePlanList.value,
  });
}

function updateGeneratorList(val: any) {
  generatePlanList.value = val;
}

// 保存为新方案
function handleSave() {
  ElMessageBox.prompt("请输入生成方案名称", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputErrorMessage: "请输入生成方案名称",
  }).then(({ value }: any) => {
    if (generatePlanList.value.find((item: any) => item.name === value)) {
      ElNotification.error("生成方案名称已存在");
      return;
    }
    currentGeneratePlan.value.id = new Date().getTime();
    currentGeneratePlan.value.name = value;
    generatePlanList.value.push(currentGeneratePlan.value);
    ElNotification.success("保存成功");
  });
}

//修改方案
function handleUpdate() {
  ElMessageBox.prompt("请输入生成方案名称", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputValue: currentGeneratePlan.value.name,
    inputErrorMessage: "请输入生成方案名称",
  }).then(({ value }: any) => {
    if (generatePlanList.value.find((item: any) => item.name === value && item.id !== currentGeneratePlan.value.id)) {
      ElNotification.error("生成方案名称已存在");
      return;
    }
    currentGeneratePlan.value.name = value;
    const index = generatePlanList.value.findIndex((item: any) => item.id === currentGeneratePlan.value.id);
    if (index === -1) {
      ElNotification.error("方案不存在,请先添加方案");
      return;
    }
    generatePlanList.value[index] = currentGeneratePlan.value;
    ElNotification.success("修改成功");
  });
}

function handleEdit(row: any) {
  currentFilePlan.value = row;
  filePlanEditDrawerRef.value?.init({
    filePlan: currentFilePlan.value,
    basePath: currentGeneratePlan.value.basePath,
  });
}

function handleUpdateFilePlan(val: any) {
  currentFilePlan.value = val;
  currentGeneratePlan.value.filePlanList.forEach((item: any) => {
    if (item.id === currentFilePlan.value.id) {
      item = currentFilePlan.value;
    }
  });
  generatePlanList.value.forEach((item: any) => {
    if (item.id === currentGeneratePlan.value.id) {
      item = currentGeneratePlan.value;
    }
  });
}
const tableRef = ref(null) as any;

async function init() {
  generatePlanList.value = props.generatePlanList;
  currentGeneratePlan.value = props.currentGeneratePlan;
  selectedRows.value = props.selectedRows;
  selectedRows.value.forEach((item: any) => {
    tableRef.value?.toggleRowSelection(item, true);
  });
}

function handleAdd() {
  ElMessageBox.confirm("新增方案会清空当前方案,请确认是否已保存当前方案?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(() => {
    currentGeneratePlan.value = {
      filePlanList: [
        {
          id: new Date().getTime(),
          planName: "文件1",
          template: "",
          suffix: "java",
        },
      ],
    };
  });
}

function handleDelete(row: any) {
  ElMessageBox.confirm("确认删除该方案吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const index = generatePlanList.value.findIndex((item: any) => item.id === row.id);
    if (index === -1) {
      ElNotification.error("方案不存在,请先添加方案");
      return;
    }
    generatePlanList.value.splice(index, 1);
    ElNotification.success("删除成功");
  });
}

function handleAddFilePlan() {
  if (!currentGeneratePlan.value.filePlanList) {
    currentGeneratePlan.value.filePlanList = [];
  }
  currentGeneratePlan.value.filePlanList.push({
    id: new Date().getTime(),
    name: "",
    fileName: "{{PascalCaseTableName}}",
    template: "",
    suffix: "java",
    generatePath: currentGeneratePlan.value.basePath,
  });
}
function validate() {
  if (!currentGeneratePlan.value) {
    ElNotification.error({
      message: "请选择生成方案",
    });
    return false;
  }
  if (!currentGeneratePlan.value.filePlanList.length) {
    ElNotification.error({
      message: "请添加文件计划",
    });
    return false;
  }
  return true;
}

async function handleTest(row: any) {
  testLoading.value = true;
  emit("handleTest", row);
}

function setTestLoading(val: boolean) {
  testLoading.value = val;
}

onMounted(() => {
  setTimeout(() => {
    init();
  }, 500);
});

defineExpose({
  currentGeneratePlan,
  generatePlanList,
  validate,
  setTestLoading,
  selectedRows,
  handleUpdateFilePlan,
});
</script>

<style lang="scss" scoped>
.generatePlan-plan {
  .el-icon,
  .svg-icon {
    margin-left: 5px;
    outline: unset;
    cursor: pointer;
  }
  .editor {
    border-radius: 0 0 4px 4px;
  }
}
.generatePlan-input {
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
.generatePlan-table {
  flex: 1;
  min-height: 0;
  .el-table {
    height: 100%;
    width: 100%;
    border-radius: 0;
  }
}
</style>
