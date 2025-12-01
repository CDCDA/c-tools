<template>
  <el-drawer
    v-model="open"
    :title="`${table.tableSchema}.${table.tableName}[${table.tableComment}]`"
    size="70%"
    direction="ltr"
    @close="close"
  >
    <div class="drawer-content">
      <div class="table-column-list">
        <!-- <el-button-group style="margin-bottom: 10px">
          <el-button type="primary" size="mini" @click="handleAdd">java</el-button>
          <el-button type="primary" size="mini" @click="handleAdd">ts</el-button>
        </el-button-group> -->
        <el-table :data="tableColumnList" style="width: 100%" border>
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="columnName" label="列名" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.columnName || "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="dataType" label="数据类型" width="250" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.dataType || "--" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="dataType"
            label="java类型"
            v-if="type === 'java'"
            align="center"
            width="150"
            show-overflow-tooltip
          >
            <template #default="scope">
              {{ translateDataType(scope.row.dataType, "java") || "--" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="dataType"
            label="ts类型"
            v-if="type === 'ts'"
            width="150"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scope">
              {{ translateDataType(scope.row.dataType, "ts") || "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="columnComment" label="注释" width="200" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ translateDataType(scope.row.columnComment, "ts") || "--" }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getTableColumns, translateDataType } from "@/utils/db.ts";
const open = ref(false);
const type = ref("java");
const close = () => {
  open.value = false;
};

const table = ref({}) as any;
const tableColumnList = ref([]) as any;
const connection = ref({}) as any;
function init(params: any) {
  table.value = params.table;
  connection.value = params.connection;
  getTableColumnList();
  open.value = true;
}

async function getTableColumnList() {
  const res = await getTableColumns(connection.value.url, table.value.tableSchema, table.value.tableName);
  tableColumnList.value = res;
  console.log(tableColumnList.value);
}

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  height: 100%;
  .table-column-list {
    height: 100%;
    .el-table {
      height: calc(100% - 40px);
    }
  }
}
</style>
