<template>
  <div class="database plugin-component">
    <el-select class="database-select" v-model="database.url" placeholder="请选择数据库">
      <el-option v-for="item in databaseList" :key="item.url" :label="item.title" :value="item.url" />
    </el-select>
    <div class="database-table">
      <el-table border :data="databaseList" style="width: 100%" selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="55" />
        <el-table-column type="index" align="center" label="序号" width="55" />
        <el-table-column prop="name" align="center" label="表名" />
        <el-table-column prop="comment" align="center" label="注释" />
        <el-table-column prop="comment" align="center" label="操作" width="55">
          <template #default="scope">
            <el-icon class="table-icon" style="cursor: pointer">
              <View />
            </el-icon>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <RegexDrawer ref="regexDrawerRef" @getRegex="handleGetRegex" @update:regexList="updateRegexList" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { View } from "@element-plus/icons-vue";
import Editor from "@/components/editor/index.vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { saveData, getData } from "@/utils/dataSave.ts";
const regexList = ref([]) as any;
const props = defineProps({
  modelValue: {
    type: Object,
    default: {
      title: "MySQL",
      url: "MySQL",
    },
  },
});
const database = ref(props.modelValue);
const databaseList = ref([
  {
    title: "MySQL",
    url: "MySQL",
  },
  {
    title: "PostgreSQL",
    url: "PostgreSQL",
  },
  {
    title: "SQLite",
    url: "SQLite",
  },
]) as any;
const emit = defineEmits(["update:database"]);

const selectedRows = ref([]) as any;

function handleSelectionChange(selection: any) {
  selectedRows.value = selection;
}

async function init() {
  databaseList.value = (await getData("codeGenerator", "databaseList")) || [];
  regex.value = (await getData("codeGenerator", "database")) || {};
  console.log("databaseList", databaseList.value);
}

onMounted(() => {
  init();
});

defineExpose({
  databaseList,
  database,
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
    }
  }
}
.database-select {
  margin-bottom: 10px;
}
</style>
