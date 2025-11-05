<template>
  <div class="page-main">
    <div class="file-select">
      <el-input v-model="targetPath">
        <template #prepend><span style="cursor: pointer" @click="handleSelectFile()">选择文件夹</span></template>
        <template #append>
          <span style="cursor: pointer" :style="{ cursor: newLoading ? 'no-drop' : 'pointer' }" @click="handleOrganize"
            >开始整理</span
          >
        </template>
      </el-input>
    </div>
    <div class="file-tree-container">
      <file-tree
        ref="fileTreeRef"
        style="width: calc(50% - 7px)"
        key="fileOrganizer"
        :defaultOptions="{ excludeFiles: '.git,node_modules,target' }"
        @update:path="(val: any) => (targetPath = val)"
      />
      <div class="tree-new">
        <div class="title">排序文件</div>
        <el-tree-v2 v-loading="newLoading" :data="newTreeData" :props="props" :height="450">
          <template #default="{ node }">
            <el-icon class="el-icon--left">
              <Document v-if="!node.data.is_file" />
              <Folder v-else-if="!node.expanded" />
              <FolderOpened v-else />
            </el-icon>
            <span>{{ node.label }}</span>
          </template>
        </el-tree-v2>
      </div>
    </div>
    <div class="tools">
      <div class="left-tools">
        <div class="ai-model">AI模型：</div>
        <el-button type="text" @click="handleSelectAiModel"
          >{{ `${aiModel.modelName}(${aiModel.modelId})` }}
        </el-button>
      </div>
      <div class="center-tools">{{ tips }}</div>
      <div class="right-tools">
        <div class="time">文件耗时：{{ (fileTreeRef?.fileConsumingTime || 0 / 1000).toFixed(2) }}s</div>
        <div class="time">整理耗时：{{ (organizeConsumingTime / 1000).toFixed(2) }}s</div>
      </div>
      <!-- <el-button type="text" @click="handleCharTree">字符树</el-button>
      <el-button type="text" @click="handleJsonTree">json树</el-button>
      <el-button type="text" @click="handleFormat">格式化</el-button> -->
    </div>
    <model-select-drawer
      ref="modelSelectDrawerRef"
      v-model:isOpen="isOpen"
      :selectedModel="aiModel"
      @setModel="setModel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Document, Folder, FolderOpened } from "@element-plus/icons-vue";
import { openFileDialog } from "@/utils/file.ts";
import { ElNotification } from "element-plus";
import { sendMessage } from "@/api/ai.ts";
import fileTree from "@/components/file/fileTree.vue";

import ModelSelectDrawer from "@/components/ai/modelSelectDrawer.vue";
const targetPath = ref("");
const newLoading = ref(false);
const tips = ref("");
const jsonFormat = [
  {
    action: "add",
    targetPath: "C:\\Users\\cit\\Desktop\\新增分类",
  },
  {
    action: "move",
    path: "C:\\Users\\cit\\Desktop\\NetAssist",
    targetPath: "C:\\Users\\cit\\Desktop\\新增分类\\NetAssist",
  },
];
const aiModel = ref({
  apiKey: "sk-e1HIH7pyEhMjxfV8A1oEK5VOCxKoXORiHwuLikXJo8jZr1MZ",
  baseUrl: "https://api.moonshot.cn/v1/chat/completions",
  modelName: "KIMI",
  stream: false,
  temperature: 0.6,
  modelId: "moonshot-v1-8k",
  message: `整理这个文件树JSON,允许新增分类文件夹,分类文件夹的名称由你决定即可,最后仅返回操作JSON,格式为${JSON.stringify(jsonFormat)},务必保证json完整`,
});
const isOpen = ref(false);
const organizeConsumingTime = ref(0);

const treeData = ref([]) as any;
const newTreeData = ref([]) as any;
const props = {
  value: "path",
  children: "children",
  label: "name",
};

const setModel = (model: any) => {
  aiModel.value = model;
};

const handleOrganize = async () => {
  const startTime = new Date().getTime();
  newLoading.value = true;
  tips.value = "AI正在整理中,请耐心等待";
  const messages = [
    {
      role: "system",
      content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手",
    },
    {
      role: "user",
      content: `${JSON.stringify(fileTreeRef.value?.treeData || [])} ${aiModel.value.message}`,
    },
  ];

  // 移除外层的 try...catch，让错误在顶层被捕获
  // 或者像下面这样进行更精细的控制

  try {
    const response = await sendMessage(messages, aiModel.value);
    if (response.ok) {
      try {
        const data = await response.json();
        const answer = data.choices[0].message.content;
        tips.value = "提取文件操作数组...";
        // 提取answer中的JSON数组
        try {
          const jsonMatch = answer.match(/\[\s*\{.*?\}\s*\]/s);
          if (jsonMatch && jsonMatch[0]) {
            const jsonArray = JSON.parse(jsonMatch[0]);
            console.log("操作数组", jsonArray);
            if (jsonArray.length > 0) {
              tips.value = "正在生成新的文件树...";
              await generateNewTree(jsonArray);
              const endTime = new Date().getTime();
              organizeConsumingTime.value = endTime - startTime;
            }
            // console.log("提取到的JSON数组:", jsonArray);
            // ElNotification.success(`成功提取到 ${jsonArray.length} 个操作项`);
          } else {
            // 尝试直接解析整个answer，可能AI直接返回了JSON而没有其他内容
            // const jsonArray = JSON.parse(answer);
            // console.log("直接解析到的JSON数组:", jsonArray);
            // ElNotification.success(`成功提取到 ${jsonArray.length} 个操作项`);
          }
        } catch (jsonExtractError) {
          console.error("提取JSON数组失败!", jsonExtractError);
          ElNotification.error("无法从AI响应中提取有效的JSON数组");
        } finally {
          newLoading.value = false;
        }
      } catch (jsonError: any) {
        console.error("解析JSON失败!", jsonError);
        ElNotification.error(`解析响应失败: ${jsonError.message}`);
      }
    } else {
      const errorData = await response.json().catch(() => response.text()); // 更健壮的错误处理
      throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }
  } catch (err: any) {
    // 这个 catch 会捕获网络错误或上面抛出的 API Error
    console.error("请求或处理过程中发生错误:", err);
    ElNotification.error(`整理失败: ${err.message}`);
  }
};

const generateNewTree = (jsonArray: any) => {
  try {
    const tempTree = JSON.parse(JSON.stringify(treeData.value));
    jsonArray.forEach((item: any) => {
      let fileName = item.targetPath.split("\\").pop();
      if (item.action === "add") {
        tempTree.push({
          name: fileName,
          path: item.targetPath,
          children: [],
        });
      }
      if (item.action === "move") {
        const index = tempTree.findIndex((node: any) => node.path === item.path);
        if (index !== -1) {
          tempTree[index].path = item.targetPath;
        }
        if (item.targetPath) {
          let dir = item.targetPath.replace(`\\${fileName}`, "");
          const targetIndex = tempTree.findIndex((node: any) => node.path === dir);
          if (targetIndex !== -1) {
            tempTree[targetIndex].children.push(tempTree[index]);
            tempTree.splice(index, 1);
          }
        }
      }
    });
    newTreeData.value = tempTree;
    console.log("新的文件树", newTreeData.value);
    newLoading.value = false;
    tips.value = "生成新的文件树成功";
  } catch (err: any) {
    console.log("生成新的文件树失败", err);
    ElNotification.error(`生成新的文件树失败: ${err.message}`);
    tips.value = "生成新的文件树失败";
  }
};
const fileTreeRef = ref<any>();

/**
 * 选择文件夹
 */
const handleSelectFile = async (path?: string) => {
  if (!path) {
    const selectPath = await openFileDialog({ directory: true });
    if (!selectPath) {
      ElNotification.error("未获取到文件夹");
      return;
    }
    targetPath.value = selectPath;
  }
  fileTreeRef.value?.getFileTree(targetPath.value);
};

const handleSelectAiModel = () => {
  isOpen.value = true;
};
</script>

<style lang="scss" scoped>
.page-main {
  padding-bottom: 0;
  height: calc(100% - 20px);
}
.file-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .file-path {
    flex: 1;
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    background: white;
    margin: 0 5px;
  }
  //margin-bottom: 10px;
}
.file-option {
  display: flex;
  // margin-bottom: 10px;
  .file-option-item:nth-child(1) {
    margin-right: 10px;
  }
}
.file-tree-container {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: space-between;
}
.tree-original,
.tree-new {
  width: calc(50% - 7px);
  height: 100%;
}
.title {
  font-size: 14px;
  padding: 5px 0;
}
.el-tree {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: calc(100% - 30px);
  :deep(.el-vl__wrapper, .el-vl__window) {
    height: 100%;
  }
}
.tools {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  .left-tools {
    display: flex;
    justify-content: start;
    align-items: center;
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
    padding: 8px 0px 9px 15px;
  }
}
</style>
