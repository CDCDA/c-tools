<template>
  <div class="page-main file-tree-json">
    <div class="file-select">
      <el-input v-model="options.path">
        <template #prepend><span style="cursor: pointer" @click="selectFile()">选择文件夹</span></template>
        <template #append><span style="cursor: pointer" @click="handleCopy">复制json</span></template>
      </el-input>
    </div>
    <div class="file-json">
      <Editor ref="jsonEditorRef" v-model="fileJson" language="json" v-loading="loading">
        <template #footer-left-prepend>
          <div class="code-editor-footer-item">
            <span class="label">耗时:</span>
            <span class="value">{{ (consumingTime / 1000).toFixed(2) }}s</span>
          </div>
        </template>
        <template #footer-right-prepend>
          <el-button type="text" class="code-editor-footer-item" @click="hanldeOpenConfig">文件查询配置</el-button>
          <el-button type="text" class="code-editor-footer-item" @click="handleCharTree">字符树</el-button>
          <el-button type="text" class="code-editor-footer-item" @click="handleJsonTree">json树</el-button>
        </template>
      </Editor>
    </div>

    <file-config-drawer ref="fileConfigDrawerRef" @update:options="updateOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import fileConfigDrawer from "@/components/file/fileConfigDrawer.vue";
import { list, openFileDialog } from "@/utils/file.ts";
import Editor from "@/components/editor/index.vue";
import { ElNotification } from "element-plus";
const fileJson = ref("");
const tempFileJson = ref("");
const jsonEditorRef = ref<any>();

const loading = ref(false);
const consumingTime = ref(0);

const options = ref({
  // 遍历的文件夹路径
  path: "",
  //最大遍历深度
  maxDepth: 10,
  // 排除的文件或文件夹，多个用逗号分隔
  excludeFiles: ".git,node_modules,target,.jar",
  // 包含的文件或文件夹，多个用逗号分隔
  includeFiles: "",
  // 是否立即刷新
  refreshImmediately: true,
});

const fileConfigDrawerRef = ref<any>(null);

function hanldeOpenConfig() {
  fileConfigDrawerRef.value.init(options.value);
}

function updateOptions(newOptions: any) {
  options.value = newOptions;
  if (options.value.refreshImmediately) {
    selectFile(options.value.path);
  }
}

const selectFile = async (path?: string) => {
  if (!path) {
    const selectPath = await openFileDialog({ directory: true });
    if (!selectPath) {
      ElNotification.error("未获取到文件夹");
      return;
    }
    options.value.path = selectPath;
  } else {
    options.value.path = path;
  }
  window.localStorage.setItem("fileTreeJson-fileOptions", JSON.stringify(options.value));
  loading.value = true;
  const startTime = new Date().getTime();

  const files = await list(options.value);
  fileJson.value = JSON.stringify(files);
  nextTick(() => {
    jsonEditorRef.value?.formatContent();
    loading.value = false;
    const endTime = new Date().getTime();
    consumingTime.value = endTime - startTime;
  });
};

const handleCopy = async () => {
  const text = fileJson.value;
  try {
    await navigator.clipboard.writeText(text);
    ElNotification({
      message: "复制成功",
      type: "success",
    });
  } catch (err) {
    console.error("复制失败:", err);
    ElNotification.error("复制失败，请重试");
  }
};

const handleCharTree = () => {
  tempFileJson.value = JSON.parse(JSON.stringify(fileJson.value));
  const charTree = JSON.parse(fileJson.value);
  fileJson.value = jsonToTreeString(charTree);
};

const handleJsonTree = () => {
  fileJson.value = tempFileJson.value;
  nextTick(() => {
    jsonEditorRef.value?.formatContent();
  });
};

interface FileNode {
  name: string;
  path: string;
  is_file: boolean;
  children: FileNode[];
}

const jsonToTreeString = (nodes: FileNode[], rootName?: string): string => {
  let output = rootName ? `${rootName}/\n` : "";
  const buildNodeString = (node: FileNode, prefix: string, isLast: boolean): string => {
    let line = prefix;
    line += isLast ? "└── " : "├── ";
    line += node.name;
    if (!node.is_file) {
      line += "/"; // 为目录添加斜杠
    }
    line += "\n";

    const newPrefix = prefix + (isLast ? "    " : "│   ");

    // 3. 递归处理所有子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const isLastChild = index === node.children.length - 1;
        line += buildNodeString(child, newPrefix, isLastChild);
      });
    }

    return line;
  };

  // 4. 遍历所有顶级节点，开始构建过程
  nodes.forEach((node, index) => {
    const isLastNode = index === nodes.length - 1;
    // 顶级节点的前缀为空
    output += buildNodeString(node, "", isLastNode);
  });

  return output;
};

onMounted(async () => {
  const fileOptions = window.localStorage.getItem("fileTreeJson-fileOptions");
  if (fileOptions) {
    options.value = JSON.parse(fileOptions);
    selectFile(options.value.path);
  }
});
</script>

<style lang="scss" scoped>
.file-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .file-path {
    flex: 1;
    height: 100%;
    border: 1px solid #d5d7dd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    background: white;
    margin: 0 5px;
  }
  margin-bottom: 10px;
}
.file-option {
  display: flex;
  margin-bottom: 10px;
  .file-option-item:nth-child(1) {
    margin-right: 10px;
  }
}
.file-json {
  flex: 1;
  min-height: 0;
}
.tools {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .tools-left,
  .tools-right {
    display: flex;
  }
  .count,
  .time {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 15px 9px 0px;
  }
}
</style>
