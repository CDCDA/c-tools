<template>
  <div class="code-editor-wrapper">
    <VAceEditor
      ref="aceEditorRef"
      v-model:value="editorContent"
      :lang="aceLanguage"
      :theme="aceTheme"
      :options="editorOptions"
      :style="editorStyle"
      @init="onEditorInit"
      @change="onContentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import { VAceEditor } from "vue3-ace-editor";
import { ElNotification } from "element-plus";
import { format } from "sql-formatter";
import { js_beautify } from "js-beautify";
import { debounce } from "lodash";

// 导入所有需要的 Ace Editor 模块
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";

// 导入代码片段
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/snippets/sql";
import "ace-builds/src-noconflict/snippets/javascript";

const props = defineProps({
  modelValue: { type: String, default: "" },
  language: { type: String, default: "json" },
  theme: { type: String, default: "light" },
  // 新增防抖延迟配置
  debounceDelay: { type: Number, default: 300 },
});
const emit = defineEmits(["update:modelValue"]);

const aceEditorRef = ref();
const editorInstance = ref();
const editorContent = ref(props.modelValue);

const debouncedEmit = debounce((value: string) => {
  emit("update:modelValue", value);
}, props.debounceDelay);

onUnmounted(() => {
  debouncedEmit.cancel();
});

// 语言映射
const languageMap = {
  json: "json",
  sql: "sql",
  javascript: "javascript",
};

// 主题映射
const themeMap = {
  light: "chrome",
  dark: "monokai",
};

const aceLanguage = computed(() => languageMap[props.language] || "text");
const aceTheme = computed(() => themeMap[props.theme] || "chrome");

// 编辑器配置
const editorOptions = {
  fontSize: 14,
  showPrintMargin: false,
  wrap: true,
  showGutter: true,
  highlightActiveLine: true,
  tabSize: 2,
  useSoftTabs: true,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
  showLineNumbers: true,
  behavioursEnabled: true,
  useWorker: true, // 启用语法检查工作线程
};

// 编辑器样式
const editorStyle = {
  width: "100%",
  height: "100%",
};

// 确保值为字符串
const ensureString = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

// 安全设置编辑器值
const safeSetValue = (value: any, cursorPosition: number = -1) => {
  if (!editorInstance.value) return;

  const stringValue = ensureString(value);

  // 设置值前先取消防抖，避免触发不必要的更新
  debouncedEmit.cancel();

  editorInstance.value.setValue(stringValue, cursorPosition);
  editorContent.value = stringValue;
};

// 编辑器初始化
const onEditorInit = (editor: any) => {
  editorInstance.value = editor;

  // 配置编辑器会话
  const session = editor.getSession();
  session.setUseWorker(true);

  // 添加自定义快捷键
  editor.commands.addCommand({
    name: "formatDocument",
    bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
    exec: formatContent,
    readOnly: false,
  });
};

watch(
  () => props.modelValue,
  (newValue) => {
    const stringValue = ensureString(newValue);
    // 只有当内容确实不同时才更新，避免循环更新
    if (stringValue !== editorContent.value) {
      // 使用安全设置方法，它会取消防抖
      safeSetValue(stringValue);
    }
  },
  { immediate: true }
);

watch(
  () => editorContent.value,
  (newValue) => {
    debouncedEmit(newValue);
  }
);

// 监听语言变化
watch(
  () => props.language,
  () => {
    nextTick(() => {
      if (editorInstance.value) {
        const session = editorInstance.value.getSession();
        session.setMode(`ace/mode/${aceLanguage.value}`);
      }
    });
  }
);

// 监听主题变化
watch(
  () => props.theme,
  () => {
    nextTick(() => {
      if (editorInstance.value) {
        editorInstance.value.setTheme(`ace/theme/${aceTheme.value}`);
      }
    });
  }
);

// 监听防抖延迟配置变化
watch(
  () => props.debounceDelay,
  (newDelay) => {
    // 如果防抖延迟改变，重新创建防抖函数
    debouncedEmit.cancel();
    debouncedEmit = debounce((value: string) => {
      emit("update:modelValue", value);
    }, newDelay);
  }
);

const formatContent = () => {
  if (!editorInstance.value) return;

  const currentContent = editorInstance.value.getValue();
  if (!currentContent.trim()) {
    ElNotification.error("内容为空");
    return;
  }

  let formattedContent = currentContent;
  try {
    if (props.language === "json") {
      const parsed = JSON.parse(currentContent);
      formattedContent = JSON.stringify(parsed, null, 2);
    } else if (props.language === "sql") {
      formattedContent = format(currentContent, { language: "sql" });
    } else if (props.language === "javascript") {
      formattedContent = js_beautify(currentContent, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "normal",
        brace_style: "collapse",
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 80,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
      });
    }

    // 使用安全设置方法
    safeSetValue(formattedContent);

    // 手动触发更新，因为格式化后内容变化需要通知父组件
    debouncedEmit(formattedContent);
  } catch (error: any) {
    console.error("格式化失败:", error);
    ElNotification.error("格式化失败:" + error.message);
  }
};

// 数组去重
function uniqueArray() {
  if (!editorInstance.value) return;

  try {
    const currentContent = editorInstance.value.getValue();
    const value = JSON.parse(currentContent);

    if (!Array.isArray(value)) {
      ElNotification.error("请输入正确的数组json格式");
      return;
    }

    const uniqueArray = Array.from(new Set(value));
    const result = JSON.stringify(uniqueArray, null, 2);
    safeSetValue(result);
    debouncedEmit(result);
  } catch (error: any) {
    console.error("数组去重失败:", error);
    ElNotification.error("数组去重失败:" + error.message);
  }
}

// 转义特殊字符
function escapeSpecialChars() {
  if (!editorInstance.value) return;

  try {
    const currentContent = editorInstance.value.getValue();
    const escapedContent = currentContent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    safeSetValue(escapedContent);
    debouncedEmit(escapedContent);
  } catch (error: any) {
    console.error("转义特殊字符失败:", error);
    ElNotification.error("转义特殊字符失败:" + error.message);
  }
}

// 去转义特殊字符
function unescapeSpecialChars() {
  if (!editorInstance.value) return;

  try {
    const currentContent = editorInstance.value.getValue();
    const unescapedContent = currentContent.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
    safeSetValue(unescapedContent);
    debouncedEmit(unescapedContent);
  } catch (error: any) {
    console.error("去转义特殊字符失败:", error);
    ElNotification.error("去转义特殊字符失败:" + error.message);
  }
}

// 获取编辑器实例（可选）
function getEditorInstance() {
  return editorInstance.value;
}

// 设置编辑器内容
function setValue(content: any) {
  safeSetValue(content);
  // 手动触发更新通知父组件
  debouncedEmit(ensureString(content));
}

// 获取编辑器内容
function getValue(): string {
  return editorInstance.value ? editorInstance.value.getValue() : "";
}

// 立即提交当前内容（不等待防抖）
function flushValue() {
  debouncedEmit.flush();
}

defineExpose({
  formatContent,
  uniqueArray,
  escapeSpecialChars,
  unescapeSpecialChars,
  getEditorInstance,
  setValue,
  getValue,
  flushValue, // 新增立即提交方法
});
</script>

<style lang="scss" scoped>
.code-editor-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  min-height: 0;

  // Ace Editor 会自动填充容器
  :deep(.vue-ace-editor) {
    height: 100%;
    width: 100%;
  }
}
</style>

<style lang="scss">
// Ace Editor 全局样式调整
.code-editor-wrapper {
  .ace_editor {
    font-family: "Consolas", "Monaco", "Andale Mono", "Ubuntu Mono", monospace !important;
    font-size: 14px !important;
    background: white !important;

    .ace_gutter {
      background: white !important;
    }

    .ace_active-line {
      background-color: #f8f9fa !important;
    }

    .ace_selection {
      background-color: #0b66b533 !important;
    }
  }
}
</style>
