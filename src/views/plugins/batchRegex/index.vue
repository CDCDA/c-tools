<template>
  <div class="page-main batch-regex">
    <div class="file-select">
      <el-input v-model="targetPath">
        <template #prepend><span style="cursor: pointer" @click="handleSelectFile()">选择文件夹</span></template>
        <template #append>
          <span style="cursor: pointer" :style="{ cursor: loading ? 'no-drop' : 'pointer' }" @click="handleRegex">
            执行正则
          </span>
        </template>
      </el-input>
    </div>
    <el-splitter>
      <el-splitter-panel :min="200" size="35%">
        <file-tree
          ref="fileTreeRef"
          style="width: calc(100% - 2px); height: calc(100%)"
          showCheckbox
          :readFile="true"
          key="batchRegex"
          @update:path="(val: any) => (targetPath = val)"
          @update:fileData="(val: any) => ((inputValue = val.content), (mode = 'single'), (currentFile = val))"
          v-if="mode === 'multi'"
        />
        <div class="editor-container" v-else style="width: calc(100% - 2px); height: calc(100%)">
          <div class="editor-input">
            <div class="header">
              <div class="title">{{ "待处理文本" }}</div>
              <div class="tools"></div>
            </div>
            <editor ref="editorInputRef" class="editor" v-model="inputValue" language="javascript" />
          </div>
          <div class="editor-input">
            <div class="header">
              <div class="title">{{ "处理结果" }}</div>
              <div class="tools"></div>
            </div>
            <editor ref="editorOutputRef" class="editor" v-model="outputValue" language="javascript" />
          </div>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="200" size="65%">
        <regex ref="regexRef" />
      </el-splitter-panel>
    </el-splitter>

    <div class="tools">
      <div class="left-tools">
        <div class="time" v-if="mode === 'multi'">
          文件耗时：<span>{{ (fileTreeRef?.consumingTime / 1000).toFixed(2) }}s</span>
        </div>
        <el-tooltip content="写入文件" placement="top">
          <el-icon @click="handleWriteFile()" v-if="currentFile.path && mode === 'single'"><Edit /></el-icon>
        </el-tooltip>
      </div>
      <div class="center-tools">{{ tips }}</div>
      <div class="right-tools">
        <div class="time">
          正则耗时：<span>{{ (regexConsumingTime / 1000).toFixed(2) }}s</span>
        </div>
        <el-tooltip :content="mode === 'single' ? '批量模式' : '单例模式'" placement="top">
          <el-icon @click="mode = mode === 'single' ? 'multi' : 'single'"><Switch /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Switch, Edit } from "@element-plus/icons-vue";
import { write, read, openFileDialog } from "@/utils/file.ts";
import { ElNotification } from "element-plus";

import Editor from "@/components/editor/index.vue";
import fileTree from "@/components/file/fileTree.vue";
import regex from "./components/regex.vue";
const editorInputRef = ref(null) as any;
const editorOutputRef = ref(null) as any;

const inputValue = ref("");
const outputValue = ref("");
const currentFile = ref<any>({});
const mode = ref("multi");
const loading = ref(false);
const tips = ref("");
const fileTreeRef = ref<any>();
const targetPath = ref("");
const regexRef = ref<any>();

const regexConsumingTime = ref(0);

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

async function handleWriteFile() {
  if (!outputValue.value) {
    ElNotification.error("请执行正则方案");
    return;
  }
  try {
    await write(currentFile.value.path, outputValue.value);
    ElNotification.success("写入成功");
  } catch (error: any) {
    ElNotification.error(`写入文件【${currentFile.value.path}】发生错误:${error.message}`);
    return;
  }
}

const handleRegex = async () => {
  regex.value = regexRef.value?.regex;
  if (mode.value === "single") {
    handleSingleRegex();
  } else {
    handleMultiRegex();
  }
};

const handleSingleRegex = async () => {
  if (!inputValue.value) {
    ElNotification.error("请输入正则表达式");
    return;
  }
  regex.value = regexRef.value?.regex;
  const startTime = new Date().getTime();
  try {
    outputValue.value = eval(regex.value.content)(inputValue.value);
  } catch (error: any) {
    ElNotification.error(`正则【${regex.value.title}】发生错误:${error.message}`);
    return;
  }
  editorOutputRef.value.setValue(outputValue.value);
  const endTime = new Date().getTime();
  regexConsumingTime.value = endTime - startTime;
};

/**
 * 处理批量正则表达式
 */
const handleMultiRegex = async () => {
  if (!targetPath.value) {
    ElNotification.error("请选择文件夹");
    return;
  }
  loading.value = true;
  tips.value = "正在处理中...";
  const startTime = new Date().getTime();
  const fileList = fileTreeRef.value.getCheckedNodes().filter((node: any) => node.is_file);
  console.log("fileList", fileList);
  let currentFile = "";
  try {
    for (const file of fileList) {
      currentFile = file.path;
      const fileData = await read(file.path);
      // console.log("fileData", fileData);
      const result = eval(regex.value.content)(fileData);
      // console.log("result", result);
      if (result) {
        await write(file.path, result);
      }
    }
    ElNotification.success(`文件内容已更新`);
    tips.value = "处理完成";
  } catch (error: any) {
    ElNotification.error(`处理文件【${currentFile}】发生错误:${error.message}`);
    tips.value = "处理失败";
  }
  const endTime = new Date().getTime();
  regexConsumingTime.value = endTime - startTime;
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.page-main.batch-regex {
  padding-bottom: 0;
  height: calc(100% - 15px);
  .el-splitter {
    height: calc(100% - 80px);
    margin-top: 15px;
  }
  .el-icon {
    cursor: pointer;
    font-size: 16px;
    &:active {
      transform: translateY(1px);
    }
  }
  .main-container {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: space-between;
    .regex {
      flex: 1;
    }

    .editor-container {
      width: 47%;
      margin-right: 15px;
      display: flex;
      flex-direction: column;
      .editor-input,
      .editor-output {
        flex: 1;
        .editor {
          height: calc(100% - 30px);
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
          // width: 100px;
        }
        .tools {
          flex: 1;
          display: flex;
          justify-content: end;
          font-size: 18px;
          .el-icon {
            margin-left: 5px;
            cursor: pointer;
          }
          .el-icon:active {
            transform: translateY(1px);
          }
        }
      }
    }
  }
}
</style>
