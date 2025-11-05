<template>
  <div class="page-main json">
    <Editor class="json-editor" ref="jsonEditorRef" v-model="jsonStr" language="json" />
    <div class="tools">
      <el-button type="text" @click="handleFormat">格式化</el-button>
      <el-button type="text" @click="handleUniqueArray">数组去重</el-button>
      <el-button type="text" @click="handleEscape">转义</el-button>
      <el-button type="text" @click="handleUnescape">去转义</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Editor from "@/components/editor/index.vue";
const jsonStr = ref("");
const jsonEditorRef = ref(null) as any;

const handleFormat = () => {
  jsonEditorRef.value?.formatContent();
};

const handleUniqueArray = () => {
  jsonEditorRef.value?.uniqueArray();
};

const handleEscape = () => {
  jsonEditorRef.value?.escapeSpecialChars();
};

const handleUnescape = () => {
  jsonEditorRef.value?.unescapeSpecialChars();
};
</script>

<style lang="scss" scoped>
.page-main.json {
  padding-bottom: 0;
  height: calc(100% - 20px);
}
.json-editor {
  border-radius: 4px;
  height: calc(100% - 12px);
}
.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>
