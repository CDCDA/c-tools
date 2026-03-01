<template>
  <div class="database part-container">
    <div class="part-header">
      <div class="part-title">
        <el-dropdown class="label-value-btn" placement="top" trigger="click">
          <el-button type="text" size="mini" style="margin-bottom: -2px">
            {{ currentDatabase.name || "请选择数据库" }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="db in databaseList"
                :key="db.url"
                @click="handleSelectDatabase(db)"
              >
                {{ db.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="part-tools">
        <el-tooltip content="添加新的数据库连接" placement="top">
          <el-icon>
            <Plus @click="handleAdd" />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="part-main database-table">
      <el-table
        border
        :data="tableList"
        ref="tableRef"
        v-loading="loading"
        row-key="tableName"
        @row-click="handleClick"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="55" />
        <!-- <el-table-column type="index" align="center" label="序号" width="55" /> -->
        <el-table-column
          prop="tableName"
          align="center"
          label="表名"
          show-overflow-tooltip
        />
        <el-table-column
          prop="tableComment"
          align="center"
          label="注释"
          show-overflow-tooltip
        />
        <el-table-column align="center" label="操作" width="55">
          <template #default="scope">
            <el-button type="text" size="mini" @click="handleView(scope.row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="part-footer">
      <div class="part-footer-left">
        <!-- <div class="part-footer-item" style="color: #979797">选中数据表生成代码</div> -->
      </div>
      <div class="part-footer-right">
        <div class="part-footer-item">
          <span>共</span>
          <span
            :style="{
              margin: '0px 5px 2px 5px',
              color: 'var(--el-color-primary)',
            }"
            >{{ tableList.length }}</span
          >
          <span>条数据</span>
        </div>
      </div>
    </div>
    <TableDrawer ref="tableDrawerRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";
import { useDatabaseStore } from "@/store/modules/database.ts";
import { getAllTables } from "@/utils/db.ts";
import TableDrawer from "./tableDrawer.vue";
const databaseStore = useDatabaseStore();
import { useRouter } from "vue-router";
const router = useRouter();
const tableList = ref([]);
const loading = ref(false);
const props = defineProps({
  modelValue: {
    type: Object,
    default: {
      title: "MySQL",
      url: "MySQL",
    },
  },
  currentDatabase: {
    type: Object,
    default: {},
  },
  selectedRows: {
    type: Array,
    default: [],
  },
});
const currentDatabase = ref(props.modelValue);
const databaseList = computed(() => databaseStore.databaseList);
const emit = defineEmits(["update:currentDatabase"]);
const tableRef = ref(null) as any;
const selectedRows = ref([]) as any;
function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}
function handleClick(row: any) {
  tableRef.value?.toggleRowSelection(row);
}
async function init() {
  await databaseStore.init();
  currentDatabase.value = props.currentDatabase;
  selectedRows.value = props.selectedRows;
  if (currentDatabase.value.url) {
    handleGetAllTables(true);
  }
}

function handleAdd() {
  router.push({
    name: "database",
  });
}

function handleSelectDatabase(db: any) {
  currentDatabase.value = db;
  handleGetAllTables();
}

async function handleGetAllTables(reload: boolean = false) {
  loading.value = true;
  try {
    const tables = await getAllTables(currentDatabase.value.url);
    tableList.value = tables;
  } catch (error) {
    ElNotification.error({
      message: `获取数据库表失败: ${error}`,
    });
  }
  loading.value = false;
  setTimeout(() => {
    if (reload) {
      selectedRows.value.forEach((item: any) => {
        tableRef.value?.toggleRowSelection(item, true);
      });
    }
  }, 1000);
}
const tableDrawerRef = ref(null) as any;
function handleView(row: any) {
  tableDrawerRef.value?.init({
    table: row,
    connection: currentDatabase.value,
  });
}

function validate() {
  if (!currentDatabase.value.url) {
    ElNotification.error({
      message: "请选择数据库",
    });
    return false;
  }
  if (!selectedRows.value.length) {
    ElNotification.error({
      message: "请选择数据表",
    });
    return false;
  }
  return true;
}

onMounted(() => {
  init();
});

defineExpose({
  databaseList,
  currentDatabase,
  validate,
  selectedRows,
});
</script>

<style lang="scss" scoped>
.database {
  height: 100%;
  display: flex;
  flex-direction: column;

  .database-table {
    flex: 1;
    min-height: 0;

    .el-table {
      height: 100%;
      width: 100%;
      border-radius: 0;
    }
  }
}

.database-select {
  margin-bottom: 10px;
}
</style>
