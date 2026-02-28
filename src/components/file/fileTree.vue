<template>
  <div class="tree-container part-container">
    <div class="part-header">
      <div class="part-title">
        {{ `文件树(${allFileKeys.length})` }}
      </div>
      <div class="part-tools">
        <el-tooltip content="全选" placement="top">
          <el-icon @click="handleSelectAll">
            <Check />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="取消全选" placement="top">
          <el-icon @click="handleUnselectAll">
            <Close />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="刷新" placement="top">
          <el-icon>
            <RefreshLeft @click="getFileTree(options.path)" />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="设置" placement="top">
          <el-icon>
            <Setting @click="hanldeOpenConfig()" />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="part-main">
      <el-tree-v2 v-loading="loading" :data="treeData" :props="defaultProps" :show-checkbox="props.showCheckbox"
        ref="treeRef" style="border-radius: 0 0 4px 4px; width: calc(100% - 2px); height: calc(100% - 2px)"
        :height="treeHeight">
        <template #default="{ node }">
          <div class="tree-node">
            <div class="node-left">
              <el-icon class="el-icon--left">
                <Document v-if="node.data.is_file" />
                <Folder v-else-if="!node.expanded" />
                <FolderOpened v-else />
              </el-icon>
              <span>{{ node.label }}</span>
            </div>
            <div class="node-right">
              <el-icon class="el-icon--right" v-if="props.readFile">
                <View @click="handleReadFile(node)" />
              </el-icon>
            </div>
          </div>
        </template>
      </el-tree-v2>
    </div>

    <file-config-drawer ref="fileConfigDrawerRef" @update:options="updateOptions" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { Document, Folder, FolderOpened, Setting, Check, Close, View, RefreshLeft } from "@element-plus/icons-vue";
import { list, read } from "@/utils/file.ts";
import { ElNotification } from "element-plus";
import fileConfigDrawer from "./fileConfigDrawer.vue";

const emit = defineEmits(["update:path", "update:fileData"]);

const props = defineProps({
  showCheckbox: {
    type: Boolean,
    default: false,
  },
  key: {
    type: String,
    default: "",
  },
  defaultOptions: {
    type: Object,
    default: {},
  },
  readFile: {
    type: String,
    default: false,
  },
});

const loading = ref(false);

const treeRef = ref<any>();

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

const allFileKeys = ref([]) as any;

// 全选功能
const handleSelectAll = () => {
  if (!treeRef.value || treeData.value.length === 0) {
    ElNotification.warning("暂无文件数据");
    return;
  }

  // 获取所有文件节点的key（路径）
  allFileKeys.value = getAllFileKeys(treeData.value);
  treeRef.value.setCheckedKeys(allFileKeys.value);
  ElNotification.success(`已全选 ${allFileKeys.value.length} 个文件`);
};

// 取消全选功能
const handleUnselectAll = () => {
  if (!treeRef.value) return;
  treeRef.value.setCheckedKeys([]);
  ElNotification.info("已取消全选");
};

// 递归获取所有文件节点的key
const getAllFileKeys = (nodes: any[]): string[] => {
  let keys: string[] = [];
  nodes.forEach((node) => {
    if (node.is_file) {
      keys.push(node.path);
    }
    if (node.children && node.children.length > 0) {
      keys = keys.concat(getAllFileKeys(node.children));
    }
  });
  return keys;
};

function updateOptions(newOptions: any) {
  options.value = newOptions;
  if (options.value.refreshImmediately) {
    getFileTree(options.value.path);
  }
}

async function handleReadFile(node: any) {
  if (!node.data.is_file) return ElNotification.error("请选择文件");
  const fileData = await read(node.data.path);
  emit("update:fileData", {
    path: node.data.path,
    content: fileData,
  });
}

const consumingTime = ref(0);

const treeData = ref([]) as any;

const defaultProps = {
  value: "path",
  children: "children",
  label: "name",
};

const fileConfigDrawerRef = ref<any>(null);

function hanldeOpenConfig() {
  fileConfigDrawerRef.value.init(options.value);
}

const getFileTree = async (path: string) => {
  if (!path) return ElNotification.error("请指定要遍历的文件夹");
  options.value.path = path;
  window.localStorage.setItem(`${props.key}-fileOptions`, JSON.stringify(options.value));
  loading.value = true;
  const startTime = new Date().getTime();
  const files = await list(options.value);
  // 递归清理空文件夹
  treeData.value = removeEmptyChildren(files);
  const endTime = new Date().getTime();
  nextTick(() => {
    calculateTreeHeight();
  });
  consumingTime.value = endTime - startTime;
  if (props.showCheckbox) {
    handleSelectAll();
  }
  loading.value = false;
};

// 递归清理空文件夹
function removeEmptyChildren(nodes: any[]) {
  if (!Array.isArray(nodes)) return nodes;
  return nodes
    .map((node: any) => {
      // 如果有children属性且是数组
      if (node.children && Array.isArray(node.children)) {
        // 递归清理子节点
        const cleanedChildren = removeEmptyChildren(node.children) as any;

        // 如果清理后子节点不为空，则保留
        if (cleanedChildren.length > 0) {
          return {
            ...node,
            children: cleanedChildren,
          };
        } else {
          const newNode = {
            ...node,
          };
          delete newNode.children;
          return newNode;
        }
      }
      return node;
    })
    .filter((node) => {
      return !(!node.children && !node.is_file);
    });
}

function init() {
  const optionStr = window.localStorage.getItem(`${props.key}-fileOptions`);
  if (optionStr) {
    options.value = JSON.parse(optionStr);
  } else if (props.defaultOptions) {
    Object.assign(options.value, props.defaultOptions);
  }
  if (options.value.path) {
    emit("update:path", options.value.path);
    getFileTree(options.value.path);
  }
}

const treeHeight = ref(400);

// 计算树的高度
const calculateTreeHeight = () => {
  nextTick(() => {
    const treeContainer = document.querySelector(".el-vl__wrapper") as HTMLElement;
    if (treeContainer) {
      const containerHeight = treeContainer.clientHeight;
      treeHeight.value = containerHeight;
    }
  });
};

// 监听窗口大小变化
const handleResize = () => {
  calculateTreeHeight();
};

onMounted(() => {
  init();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

function getCheckedNodes() {
  return treeRef.value?.getCheckedNodes();
}

defineExpose({
  getFileTree,
  consumingTime,
  treeData,
  options,
  getCheckedNodes,
});
</script>
<style scoped lang="scss">
.tree-container {
  width: 100%;
  height: 100%;

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 25px;
    width: 100%;

    .node-right {
      display: flex;
      align-items: center;
    }
  }

  .header {
    font-size: 14px;
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .title {
      width: 100px;
    }

    .tools {
      width: 100%;
      display: flex;
      justify-content: end;
      align-items: center;
      font-size: 18px;

      .el-icon:active {
        transform: translateY(1px);
      }

      .el-icon,
      .svg-icon {
        cursor: pointer;
        margin-left: 5px;
        outline: unset;
      }

      .left-tools {
        display: flex;
        justify-content: start;
        align-items: center;

        .el-button--text {
          margin-top: 2px;
        }
      }

      .right-tools {
        display: flex;
        justify-content: end;
        align-items: center;
      }

      .count,
      .time {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 0px 9px 0px;
      }
    }
  }

  .el-tree {
    width: 100%;
    border: 1px solid #EBEBEB;
    border-radius: 4px;
    height: calc(100% - 30px);

    :deep(.el-vl__wrapper, .el-vl__window) {
      height: 100%;
    }
  }
}
</style>
