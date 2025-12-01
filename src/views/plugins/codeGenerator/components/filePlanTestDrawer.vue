<template>
  <el-drawer v-model="open" :title="`模板测试 [${filePlan.planName}]`" size="90%" direction="rtl" @close="close">
    <div class="drawer-content part-container">
      <el-splitter>
        <el-splitter-panel :min="220" size="40%">
          <div class="part-header">
            <div class="part-title">模板</div>
            <div class="part-tools">
              <el-button type="text" size="mini" @click="handleTest">开始测试</el-button>
            </div>
          </div>
          <div class="part-main">
            <Editor class="editor" v-model="filePlan.template" :language="type" />
          </div>
        </el-splitter-panel>
        <el-splitter-panel :min="220" size="60%">
          <div class="part-header">
            <div class="part-title">生成结果</div>
            <div class="part-tools">
              <el-button type="text" size="mini" @click="handleSave">保存</el-button>
              <el-button type="text" size="mini" @click="handleSaveAndClose">保存并退出</el-button>
            </div>
          </div>
          <div class="part-main">
            <Editor class="editor" v-model="result" :language="type" />
          </div>
        </el-splitter-panel>
      </el-splitter>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref } from "vue";
import Editor from "@/components/editor/index.vue";
import { codeParser } from "@/utils/codeParser.ts";
const emit = defineEmits(["save"]);
const open = ref(false);
const type = ref("java");
const close = () => {
  open.value = false;
};
const result = ref("");
const filePlan = ref({}) as any;
const tableData = ref({}) as any;

function init(params: any) {
  tableData.value = params.tableData;
  filePlan.value = params.filePlan;
  open.value = true;
}

async function handleTest() {
  if (!filePlan.value.template) {
    ElNotification.error({
      title: "测试失败",
      message: "请输入模板",
    });
    return;
  }
  console.log("tableData", filePlan.value.template, tableData.value);
  const fileContent = await codeParser.parse(filePlan.value.template, tableData.value);
  result.value = fileContent;
}

function handleSave() {
  emit("save", filePlan.value);
}

function handleSaveAndClose() {
  handleSave();
  close();
}
defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  height: 100%;
  .editor {
    border-radius: 0 0 4px 4px;
  }
  :deep(.el-splitter-panel) {
    display: flex;
    flex-direction: column;
  }
}
</style>
