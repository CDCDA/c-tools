<template>
  <div class="page-main json">
    <Editor class="json-editor" ref="jsonEditorRef" v-model="jsonStr" language="json">
      <template #footer-right>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleFormat">格式化</el-button>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleUniqueArray"
          >数组去重</el-button
        >
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleEscape">转义</el-button>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleUnescape">去转义</el-button>
      </template>
    </Editor>
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
