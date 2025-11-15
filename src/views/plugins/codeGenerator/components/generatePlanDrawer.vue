<template>
  <el-drawer v-model="open" title="生成方案" size="350px" direction="rtl" @close="close">
    <div class="drawer-content">
      <div class="generator-list">
        <div class="tools">
          <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
          <el-button type="danger" size="mini" @click="handleDelete()" :disabled="selectedRows.length === 0"
            >删除</el-button
          >
        </div>
        <el-table
          :data="generatorList"
          style="width: 100%"
          border
          @row-dblclick="handleClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="title" label="生成方案名称" width="auto" align="center">
            <template #default="scope">
              {{ scope.row.title || "未命名" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button type="text" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref } from "vue";

const open = ref(false);
const emit = defineEmits(["getGenerator", "update:generatorList"]);

const close = () => {
  open.value = false;
};

const init = (params: any) => {
  generatorList.value = params.generatorList;
  open.value = true;
};

const generatorList = ref([]) as any;

function handleClick(row: any) {
  emit("getGenerator", row);
  open.value = false;
}

function handleAdd() {
  const generator = {
    id: randomIntFromInterval(1, 1000000000),
    title: "",
    content: "//fileData:文件字符数据\n(fileData) => {\n\n\n\n\n\n\n    return fileData\n}",
  };
  emit("getGenerator", generator);
  open.value = false;
}

function handleUpdate(row: any) {
  emit("getGenerator", row);
  open.value = false;
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
      generatorList.value = generatorList.value.filter((item: any) => item.id !== row.id);
    } else {
      const ids = selectedRows.value.map((item: any) => item.id);
      generatorList.value = generatorList.value.filter((item: any) => !ids.includes(item.id));
    }
    emit("update:generatorList", generatorList.value);
    ElNotification.success("删除成功");
  });
}

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  .tools {
    margin-bottom: 10px;
  }
}
</style>
