<template>
  <div :class="['code-editor-wrapper', { fullscreen: editorOptions.fullScreen }]">
    <div class="header" data-tauri-drag-region v-if="editorOptions.fullScreen">编辑器</div>
    <VAceEditor ref="aceEditorRef" v-model:value="editorContent" :lang="currentLanguage" :theme="aceTheme"
      :options="editorOptions" :style="editorStyle" @init="onEditorInit" />
    <div class="code-editor-footer">
      <div class="code-editor-footer-left">
        <slot name="footer-left-prepend"></slot>
        <slot name="footer-left">
          <div class="code-editor-footer-item">
            <span class="label">字数:</span>
            <span class="value">{{ editorContent.length }}</span>
          </div>
        </slot>
        <slot name="footer-left-append"></slot>
      </div>
      <div class="code-editor-footer-right">
        <slot name="footer-right-prepend"></slot>

        <slot name="footer-right">
          <el-dropdown class="code-editor-footer-item" placement="top" trigger="click">
            <el-button type="text" size="mini" style="margin-bottom: 2px" class="language-button">
              {{ currentLanguage }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="lang in languageList" :disabled="lang === currentLanguage" :key="lang"
                  @click="changeLanguage(lang)">
                  {{ lang }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="text" size="mini" class="code-editor-footer-item" @click="fullScreen">
            {{ editorOptions.fullScreen ? "退出全屏" : "全屏" }}
          </el-button>

          <el-button type="text" size="mini" class="code-editor-footer-item" @click="formatContent"> 格式化 </el-button>
        </slot>
        <slot name="footer-right-append"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, reactive } from "vue";
import { VAceEditor } from "vue3-ace-editor";
import { ElNotification } from "element-plus";
import { format } from "sql-formatter";
import { debounce } from "lodash";
import { js_beautify, css_beautify, html_beautify } from "js-beautify";
// 导入所有需要的 Ace Editor 模块
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";

// 导入代码片段
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/snippets/sql";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/snippets/css";
import "ace-builds/src-noconflict/snippets/html";
import "ace-builds/src-noconflict/snippets/sh";

// 导入 worker 文件
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/worker-javascript";

// 配置 worker 路径
const aceConfig = ace.config;
aceConfig.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.32.2/src-noconflict/");
aceConfig.setModuleUrl(
  "ace/mode/javascript_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.32.2/src-noconflict/worker-javascript.js"
);
aceConfig.setModuleUrl(
  "ace/mode/json_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.32.2/src-noconflict/worker-json.js"
);

const props = defineProps({
  modelValue: { type: String, default: "" },
  language: { type: String, default: "json" },
  theme: { type: String, default: "light" },
  // 新增防抖延迟配置
  debounceDelay: { type: Number, default: 300 },
});

const emit = defineEmits(["update:modelValue", "update:language"]);

const aceEditorRef = ref();
const editorInstance = ref();
const editorContent = ref(props.modelValue);

let debouncedEmit = debounce((value: string) => {
  emit("update:modelValue", value);
}, props.debounceDelay);

onUnmounted(() => {
  debouncedEmit.cancel();
});
function fullScreen() {
  if (!editorInstance.value) return;
  editorOptions.fullScreen = !editorOptions.fullScreen;
}
// 语言映射
const languageList = ["json", "sql", "javascript", "java", "css", "html", "shell", "nginx"] as any;

// 主题映射
const themeMap = {
  light: "chrome",
  dark: "monokai",
} as any;

const currentLanguage = ref(props.language);
const aceTheme = computed(() => themeMap[props.theme] || "chrome") as any;

// 编辑器配置
const editorOptions = reactive({
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
  fullScreen: false,
  useWorker: true, // 启用语法检查工作线程
});

function changeLanguage(lang: string) {
  emit("update:language", lang);
  currentLanguage.value = lang;
}
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
      currentLanguage.value = props.language;
      if (editorInstance.value) {
        const session = editorInstance.value.getSession();
        session.setMode(`ace/mode/${currentLanguage.value}`);
      }
    });
  },
  {
    immediate: true,
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
  console.log(currentLanguage.value);
  try {
    if (currentLanguage.value === "json") {
      const parsed = JSON.parse(currentContent);
      formattedContent = JSON.stringify(parsed, null, 2);
    } else if (currentLanguage.value === "sql") {
      formattedContent = format(currentContent, { language: "sql" });
    } else if (currentLanguage.value === "javascript" || currentLanguage.value === "java") {
      // Java 属于 C 风格家族，js_beautify 处理效果很好
      formattedContent = js_beautify(currentContent, {
        indent_size: currentLanguage.value === "java" ? 4 : 2, // Java 规范通常是 4 空格
        indent_char: " ",
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "normal",
        brace_style: "collapse", // 大括号在行末
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 120, // Java 代码通常较长
      });
    } else if (currentLanguage.value === "css") {
      console.log(currentContent);
      formattedContent = css_beautify(currentContent, {
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
    } else if (currentLanguage.value === "html") {
      formattedContent = html_beautify(currentContent, {
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
        indent_inner_html: true,
        comma_first: false,
        e4x: true,
        indent_empty_lines: false,
      });
    } else if (currentLanguage.value === "shell") {
      // 简单的Shell脚本格式化，基于缩进
      const lines = currentContent.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('do') || trimmedLine.endsWith('then')) {
          const result = ' '.repeat(indentLevel * indentSize) + trimmedLine;
          indentLevel++;
          return result;
        } else if (trimmedLine.startsWith('}') || trimmedLine.startsWith('done') || trimmedLine.startsWith('fi')) {
          indentLevel = Math.max(0, indentLevel - 1);
          return ' '.repeat(indentLevel * indentSize) + trimmedLine;
        } else {
          return ' '.repeat(indentLevel * indentSize) + trimmedLine;
        }
      });
      formattedContent = formattedLines.join('\n');
    } else if (currentLanguage.value === "nginx") {
      // Nginx配置文件格式化
      const lines = currentContent.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      const indent = ' '.repeat(indentSize);
      let result = '';

      for (const line of lines) {
        let trimmed = line.trim();

        if (trimmed === '') {
          result += '\n';
          continue;
        }

        // 处理闭合括号
        if (trimmed.endsWith('}')) {
          if (trimmed.length > 1) {
            result += indent.repeat(indentLevel) + trimmed.replace('}', '') + '\n';
            trimmed = '}';
          }
          indentLevel = Math.max(0, indentLevel - 1);
        }
        // 添加缩进
        result += indent.repeat(indentLevel) + trimmed + '\n';

        // 处理开括号
        if (trimmed.endsWith('{')) {
          indentLevel++;
        }
      }

      formattedContent = result;
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

    // 深度去重函数
    const getUniqueKey = (item: any) => {
      if (item === null) return "null";
      if (typeof item === "object") {
        // 对对象按键排序后字符串化，确保顺序不影响比较
        const sortedObj = Object.keys(item)
          .sort()
          .reduce((acc: any, key: any) => {
            acc[key] = item[key];
            return acc;
          }, {});
        return JSON.stringify(sortedObj);
      }
      return item;
    };

    const seen = new Set();
    const uniqueArray = value.filter((item: any) => {
      const key = getUniqueKey(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
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
  height: calc(100% - 10px);
  width: calc(100% - 2px);
  overflow: hidden;
  border: 1px solid #d5d7dd;
  background: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 0px 0px 0px;

  .code-editor-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    height: 30px;
    border-top: 1px solid #d5d7dd;

    .code-editor-footer-left,
    .code-editor-footer-right {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .code-editor-footer-left {
      .code-editor-footer-item {
        margin-right: 10px;
      }
    }

    .code-editor-footer-right {
      .code-editor-footer-item {
        margin-left: 10px;
      }
    }

    .code-editor-footer-item {
      font-size: 14px !important;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2px;
      }
    }

    .el-dropdown {
      height: 100%;
    }
  }

  .header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #d5d7dd;
  }

  // Ace Editor 会自动填充容器
  :deep(.vue-ace-editor) {
    height: calc(100% - 20px);
    flex: 1;
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

.fullscreen {
  height: 100% !important;
  width: 100% !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 9999 !important;
  padding: 0 !important;
}
</style>
