<template>
  <el-drawer v-model="open" title="代码文件生成方案" size="70%" direction="rtl" @close="close">
    <div class="drawer-content">
      <el-form :model="filePlan" ref="formRef" label-width="70px">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="数据示例" name="0">
            <div class="data-template">
              <h4>数据结构说明：</h4>
              <el-table
                :data="templateTableData"
                border
                style="width: 100%; margin-top: 10px"
                :row-class-name="tableRowClassName"
              >
                <el-table-column type="expand" width="60">
                  <template #default="scope">
                    <div v-if="scope.row.field === 'columns'" class="columns-expand">
                      <el-table :data="columnsTableData" border size="small">
                        <el-table-column prop="field" label="字段名" width="180" />
                        <el-table-column prop="type" label="类型" width="120" />
                        <el-table-column prop="description" label="说明" />
                      </el-table>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="field" label="字段名" width="180" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="说明" />
              </el-table>
            </div>
          </el-collapse-item>
          <el-collapse-item title="基础配置" name="1">
            <el-form-item label="方案名称" prop="name">
              <el-input v-model="filePlan.planName" placeholder="请输入方案名称" />
            </el-form-item>
            <el-form-item label="文件名称" prop="fileName">
              <el-input v-model="filePlan.fileName" placeholder="{{PascalCaseTableName}}" />
            </el-form-item>
            <el-form-item label="文件后缀" prop="suffix">
              <el-input v-model="filePlan.suffix" placeholder="请输入文件后缀" />
            </el-form-item>
            <el-form-item label="文件语言" prop="language">
              <el-select v-model="filePlan.language" placeholder="请选择文件语言">
                <el-option label="Java" value="java" />
                <el-option label="SQL" value="sql" />
                <el-option label="Ts" value="ts" />
                <el-option label="Js" value="js" />
              </el-select>
            </el-form-item>
            <el-form-item label="生成路径" prop="generatePath">
              <el-input v-model="filePlan.generatePath" placeholder="存放路径=生成路径/文件名称.文件后缀" />
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item title="自定义配置" name="2">
            <div class="tools">
              <el-button type="primary" size="mini" @click="handleAddCustomConfig">添加</el-button>
              <el-button type="danger" size="mini" @click="handleRemoveCustomConfig()">删除</el-button>
            </div>
            <el-table
              :data="filePlan.customConfigs"
              style="width: 100%"
              border
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" align="center" width="55" fixed="left" />
              <el-table-column type="index" align="center" label="序号" width="55" fixed="left" />
              <el-table-column label="名称" prop="label" align="center" width="150">
                <template #default="scope">
                  <el-input v-model="scope.row.label" placeholder="请输入名称" />
                </template>
              </el-table-column>

              <el-table-column label="键" prop="key" align="center" width="100">
                <template #default="scope">
                  <el-input v-model="scope.row.key" placeholder="请输入键" />
                </template>
              </el-table-column>
              <el-table-column label="值" prop="value" align="center" width="120">
                <template #default="scope">
                  <el-input v-model="scope.row.value" placeholder="请输入值" />
                </template>
              </el-table-column>
              <el-table-column label="描述" prop="description" align="center" width="120">
                <template #default="scope">
                  <el-input type="textarea" v-model="scope.row.desc" placeholder="请输入描述" />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="55" fixed="right">
                <template #default="scope">
                  <el-button type="text" size="mini" style="color: #f56c6c" @click="handleRemoveCustomConfig(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item title="文件模板" name="3">
            <Editor
              class="editor"
              ref="editorRef"
              style="height: 300px"
              v-model="filePlan.template"
              :language="filePlan.language"
            />
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button type="danger" size="mini" @click="close">取消</el-button>
      <el-button type="primary" size="mini" @click="handleSave">保存</el-button>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import Editor from "@/components/editor/index.vue";
import { ref, computed, onMounted } from "vue";

// 初始化 filePlan 避免 null 值
const filePlan = ref({
  id: null,
  planName: "",
  fileName: "",
  suffix: "",
  language: "",
  generatePath: "",
  template: "",
  customConfigs: [],
}) as any;

const templateTableData = computed(() => [
  { field: "tableName", type: "string", description: "表名" },
  { field: "camelCaseTableName", type: "string", description: "表名(小驼峰)" },
  { field: "PascalCaseTableName", type: "string", description: "表名(大驼峰)" },
  { field: "kebabCaseTableName", type: "string", description: "表名(短横线)" },
  { field: "tableComment", type: "string", description: "表注释" },
  { field: "columns", type: "array", description: "列信息数组" },
]);

const columnsTableData = computed(() => [
  { field: "columnName", type: "string", description: "列名" },
  { field: "camelCaseColumnName", type: "string", description: "列名(小驼峰)" },
  { field: "pascalCaseColumnName", type: "string", description: "列名(大驼峰)" },
  { field: "columnComment", type: "string", description: "列注释" },
  { field: "realType", type: "string", description: "数据类型" },
  { field: "isPrimaryKey", type: "boolean", description: "是否主键" },
  { field: "isDate", type: "boolean", description: "是否日期类型" },
]);

const tableRowClassName = ({ row }: { row: any }) => {
  return row.field === "columns" ? "expandable-row" : "expandable-row-hidden";
};

const open = ref(false);
const emit = defineEmits(["update:currentFilePlan"]);
const activeNames = ref(["1"]);
const selectedRows = ref([]);

const close = () => {
  open.value = false;
};

function init(params: any) {
  // 安全地初始化 filePlan，确保不会传入 null
  if (params && params.filePlan) {
    filePlan.value = params.filePlan;
  }
  open.value = true;
}

function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

function handleAddCustomConfig() {
  // 确保 customConfigs 存在
  if (!filePlan.value.customConfigs) {
    filePlan.value.customConfigs = [];
  }
  filePlan.value.customConfigs.push({
    label: "",
    key: "",
    value: "",
    desc: "",
  });
}

function handleRemoveCustomConfig(row?: any) {
  if (row) {
    filePlan.value.customConfigs = filePlan.value.customConfigs.filter((item: any) => item !== row);
    return;
  }
  const selectedKeys = selectedRows.value.map((item: any) => item.key);
  if (selectedKeys.length === 0) {
    ElNotification.warning("请选择要删除的项");
    return;
  }
  filePlan.value.customConfigs = filePlan.value.customConfigs.filter((item: any) => !selectedKeys.includes(item.key));
}

function handleSave() {
  console.log("filePlan.value", filePlan.value);
  emit("update:currentFilePlan", filePlan.value);
  close();
}

// 组件挂载时确保数据初始化
onMounted(() => {
  if (!filePlan.value.customConfigs) {
    filePlan.value.customConfigs = [];
  }
});

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  flex: 1;
  .tools {
    margin-bottom: 10px;
  }
  .el-button {
    height: 28px;
  }
  :deep(.el-table__row:last-child .el-table__cell) {
    border-bottom: none;
  }

  .data-template {
    h4 {
      margin: 0 0 10px 0;
      color: #606266;
    }

    .columns-expand {
      padding: 10px;
      h5 {
        margin: 0 0 10px 0;
        color: #909399;
      }
    }

    // // 隐藏所有行的展开箭头
    // :deep(.el-table__expand-column) {
    //   .el-table__expand-icon {
    //     display: none;
    //   }
    // }

    // 或者只隐藏特定行的展开箭头（推荐这种方式）
    :deep(.expandable-row-hidden) {
      td:first-child .cell {
        display: none;
      }
    }
  }
}
</style>
