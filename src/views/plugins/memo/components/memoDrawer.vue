<template>
  <el-drawer v-model="open" title="添加备忘录" size="75%" direction="btt" @close="close">
    <div class="drawer-content">
      <el-form :model="memoData" ref="formRef" :rules="rules" style="height: 100%;" label-width="4rem">
        <el-form-item label="标题" prop="title">
          <el-input v-model="memoData.title" placeholder="请输入标题" @keyup.enter="submit()" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <WangEditor ref="wangEditorRef" style="height: 285px;" v-model="memoData.content" showToolBar />
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button type="primary" @click="submit()">确定</el-button>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import WangEditor from "@/components/wangEditor/index.vue";
const open = ref(false);
const memoData = ref<any>({});
const emit = defineEmits(["submit"]);
function init(params: any) {
  const { action, memo, activeType } = params;
  action === "add" ? (memoData.value = { type: activeType, title: "", content: "" }) : (memoData.value = memo);
  open.value = true;
}
const rules = ref<any>({
  // title: [{ required: true, message: "请输入标题", trigger: ["blur"] }],
  content: [{ required: true, message: "请输入内容", trigger: ["blur"] }],
});

const formRef = ref<any>(null);
const wangEditorRef = ref<any>(null);

const submit = () => {
  formRef.value?.validate((valid: any) => {
    if (valid) {
      memoData.value.text = wangEditorRef.value?.getText();
      emit("submit", memoData.value);
      open.value = false;
    }
  });
};

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
