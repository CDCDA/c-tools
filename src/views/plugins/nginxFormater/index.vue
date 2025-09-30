<template>
  <div class="page-main nginx">
    <Editor class="nginx-editor" ref="nginxEditorRef" v-model="nginxStr" language="nginx" :theme="currentTheme" />
    <div class="tools">
      <el-button type="text" @click="handleFormat">格式化</el-button>
      <!-- <el-button type="text" @click="handleDuplicateRemoval">数组去重</el-button>
      <el-button type="text">转义</el-button>
      <el-button type="text">去转义</el-button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Editor from "@/components/editor/index.vue";
import { format } from "nginxbeautifier";

const nginxStr = ref("");
const nginxEditorRef = ref(null);

const simpleFormatNginx = (config: string, indentSize: number = 2): string => {
  const lines = config.split("\n");
  let indentLevel = 0;
  const indent = " ".repeat(indentSize);
  let result = "";

  for (const line of lines) {
    let trimmed = line.trim();

    if (trimmed === "") {
      result += "\n";
      continue;
    }

    // 处理闭合括号
    if (trimmed.endsWith("}")) {
      if (trimmed.length > 1) {
        console.log("QQQ", indent.repeat(indentLevel) + trimmed.replace("}", "") + "\n");
        result += indent.repeat(indentLevel) + trimmed.replace("}", "") + "\n";
        trimmed = "}";
      }
      indentLevel = Math.max(0, indentLevel - 1);
    }
    // 添加缩进
    result += indent.repeat(indentLevel) + trimmed + "\n";

    // 处理开括号
    if (trimmed.endsWith("{")) {
      indentLevel++;
    }
  }

  return result;
};

const handleFormat = () => {
  nginxStr.value = simpleFormatNginx(nginxStr.value, 2);
  // nginxEditorRef.value?.formatContent();
};
</script>

<style lang="scss" scoped>
.page-main.nginx {
  padding-bottom: 0;
  height: calc(100% - 20px);
}
.nginx-editor {
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
