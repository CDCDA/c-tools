<template>
  <div class="page-main code-generator">
    <div class="main-container">
      <el-splitter>
        <el-splitter-panel :min="200" size="50%">
          <database ref="databaseRef" :currentDatabase="data.currentDatabase" :selectedRows="data.selectedTableList" />
        </el-splitter-panel>
        <el-splitter-panel :min="200" size="50%">
          <generatePlan
            ref="generatePlanRef"
            :generatePlanList="data.generatePlanList"
            :currentGeneratePlan="data.currentGeneratePlan"
            :selectedRows="data.selectedFilePlanList"
            @handleTest="handleTest"
          />
        </el-splitter-panel>
      </el-splitter>
    </div>

    <div class="tools">
      <div class="left-tools">
        <div class="time">
          生成耗时：<span>{{ (generateConsumingTime / 1000).toFixed(2) }}s</span>
        </div>
      </div>
      <div class="center-tools">
        {{ tip
        }}<el-link style="margin-left: 5px" v-if="tip === '生成完成'" type="primary" @click="handleOpenFile">
          查看文件
        </el-link>
      </div>
      <div class="right-tools">
        <el-button type="text" size="mini" @click="handleGenerate"> 开始生成 </el-button>
      </div>
    </div>
    <FilePlanTestDrawer ref="filePlanTestDrawerRef" @save="handleSaveFilePlan" />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { write, openFolder } from "@/utils/file.ts";
import { ElNotification } from "element-plus";
import GeneratePlan from "./components/generatePlan.vue";
import { codeParser } from "@/utils/codeParser.ts";
import { getTableColumns, translateDataType } from "@/utils/db.ts";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";
import { toCamelCase, toKebabCase } from "@/utils/formatters.ts";
import Database from "./components/database.vue";
import FilePlanTestDrawer from "./components/filePlanTestDrawer.vue";
import { formatDate } from "@/utils/date.ts";
const databaseRef = ref(null) as any;
const generateConsumingTime = ref(0);
const tip = ref("");
const generatePlanRef = ref(null) as any;

function handleSaveFilePlan(val: any) {
  try {
    generatePlanRef.value?.handleUpdateFilePlan(val);
    ElNotification.success({
      message: "文件方案保存成功",
    });
  } catch (error) {
    ElNotification.error({
      message: `文件方案保存失败:${error}"`,
    });
  }
}

function saveLocalData() {
  const data = {
    // 所有方案
    generatePlanList: generatePlanRef.value?.generatePlanList || [],
    // 当前选中方案
    currentGeneratePlan: generatePlanRef.value?.currentGeneratePlan || {},
    // 当前选中文件方案
    selectedFilePlanList: generatePlanRef.value?.selectedRows || [],
    // 当前选中数据表
    selectedTableList: databaseRef.value?.selectedRows || [],
    // 当前选中数据库
    currentDatabase: databaseRef.value?.currentDatabase || {},
  };
  console.log("data", data);
  if (JSON.stringify(data) === "{}") {
    return;
  }
  savePluginData("codeGenerator", data);
}

async function getFirstSelectedTableData(plan: any) {
  if (!plan) {
    ElNotification.error({
      message: "当前没有文件方案",
    });
    return null;
  }
  const connection = databaseRef.value?.currentDatabase;
  const tables = databaseRef.value?.selectedRows.filter((item: any) => item.tableName);
  if (!tables.length) {
    ElNotification.error({
      message: "请选择一个数据表",
    });
    return null;
  }
  const table = tables[0];
  console.log("table", table);
  const columns = await getTableColumns(connection.url, table.tableSchema, table.tableName);
  const tableData = {
    tableName: table.tableName,
    // 小驼峰
    camelCaseTableName: toCamelCase(table.tableName),
    // 大驼峰
    PascalCaseTableName: toCamelCase(table.tableName, true),
    // 短横线命名
    kebabCaseTableName: toKebabCase(table.tableName, false),
    tableComment: table.tableComment,
    dateTime: formatDate(new Date()),
    columns: columns.map((item: any) => ({
      columnName: item.columnName,
      // 小驼峰
      camelCaseColumnName: toCamelCase(item.columnName),
      // 大驼峰
      pascalCaseColumnName: toCamelCase(item.columnName, true),
      columnComment: item.columnComment,
      realType: translateDataType(item.dataType, plan.language),
      isPrimaryKey: item.isPrimaryKey,
      isDate: item.dataType.includes("date") || item.dataType.includes("time"),
    })),
  };

  return tableData;
}

const filePlanTestDrawerRef = ref(null) as any;
async function handleTest(row: any) {
  const tableData = await getFirstSelectedTableData(row);
  if (!tableData) {
    generatePlanRef.value?.setTestLoading(false);
    return;
  }
  const params = {
    filePlan: row,
    tableData,
  };
  filePlanTestDrawerRef.value?.init(params);
  generatePlanRef.value?.setTestLoading(false);
}

function extractTemplateKeys(template: string) {
  const regex = /\{\{([^{}]+)\}\}/g;
  const keys: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    keys.push(match[1].trim());
  }
  return keys;
}

function replaceTemplateKeys(template: string, data: any) {
  const keys = extractTemplateKeys(template) || [];
  if (!keys.length) {
    return template;
  }
  console.log("1111", keys, data);
  for (const key of keys) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), data[key] || "");
  }
  return template;
}

const handleGenerate = async () => {
  if (!databaseRef.value.validate()) {
    return;
  }
  if (!generatePlanRef.value.validate()) {
    return;
  }
  const connection = databaseRef.value?.currentDatabase;
  const tables = databaseRef.value?.selectedRows.filter((item: any) => item.tableName);
  const planList = generatePlanRef.value?.currentGeneratePlan.filePlanList;

  tip.value = "生成中...";
  const start = Date.now();
  for (const table of tables) {
    try {
      const columns = await getTableColumns(connection.url, table.tableSchema, table.tableName);
      const fileList = [];
      for (const plan of planList) {
        const tableData = {
          tableName: table.tableName,
          // 小驼峰
          camelCaseTableName: toCamelCase(table.tableName),
          // 大驼峰
          PascalCaseTableName: toCamelCase(table.tableName, true),
          tableComment: table.tableComment,
          columns: columns.map((item: any) => ({
            columnName: item.columnName,
            // 小驼峰
            camelCaseColumnName: toCamelCase(item.columnName),
            // 大驼峰
            pascalCaseColumnName: toCamelCase(item.columnName, true),
            columnComment: item.columnComment,
            realType: translateDataType(item.dataType, plan.language),
            isPrimaryKey: item.isPrimaryKey,
            isDate: item.dataType.includes("date") || item.dataType.includes("time"),
          })),
        } as any;
        const fileContent = await codeParser.parse(plan.template, tableData);
        let { fileName, generatePath } = plan;
        fileName = replaceTemplateKeys(fileName, tableData);
        generatePath = replaceTemplateKeys(generatePath, tableData);
        const file = {
          content: fileContent,
          path: `${generatePath}/${fileName}.${plan.suffix}`,
        };
        console.log("file", file);
        write(file.path, file.content);
        fileList.push(file);
      }
    } catch (err: any) {
      ElNotification.error({
        title: "生成失败",
        message: err,
      });
      tip.value = `生成失败`;
      return;
    }
  }
  const end = Date.now();
  generateConsumingTime.value = end - start;
  tip.value = "生成完成";
};

const data = ref({}) as any;

async function loadLocalData() {
  Object.assign(data.value, await getPluginData("codeGenerator"));
  console.log(data.value);
}

async function handleOpenFile() {
  await openFolder(generatePlanRef.value?.currentGeneratePlan.basePath);
}

loadLocalData();
window.addEventListener("beforeunload", saveLocalData);

onBeforeUnmount(() => {
  saveLocalData();
  window.removeEventListener("beforeunload", saveLocalData);
});
</script>

<style lang="scss">
.page-main.code-generator {
  padding: 15px 15px 0 15px;
  height: calc(100% - 15px);
  .main-container {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: space-between;

    .main-container-left {
      width: calc(50% - 5px);
    }

    .main-container-right {
      width: calc(50% - 5px);
    }
  }
}
</style>
