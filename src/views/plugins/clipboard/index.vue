<template>
  <div class="page-main clipboard">
    <div class="clipboard-history">
      <div class="history-list">
        <div v-for="(item, index) in textList" :key="index" class="history-item" @click="handleCopy(item.content)">
          <div class="item-header">
            <div class="timestamp">{{ item.timestamp }}</div>
          </div>
          <div class="content" @dblclick="handleDoubleClick(item.content)">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { ElMessage } from "element-plus";
import { currentWindow } from "@/utils/window.ts";
import { invoke } from "@tauri-apps/api/core";

const textList = ref([]) as any;

// 格式化时间为 YYYY-MM-DD HH:MM:SS
const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
// const handleFormat = () => {
//   jsonEditorRef.value?.format();
// };

const handleDoubleClick = async (content: any) => {
  try {
    await currentWindow.hide();
    try {
      await invoke("paste", { text: content });
    } catch (error: any) {
      console.error("插入失败:", error);
    }
  } catch (error: any) {
    ElMessage({
      message: "插入失败，请手动粘贴",
      type: "error",
      duration: 2000,
    });
    console.error("插入失败:", error);
  }
};

const handleCopy = async (content: any) => {
  try {
    await writeText(content);
    ElMessage({
      message: "复制成功",
      type: "success",
      duration: 1500,
    });
  } catch (error: any) {
    ElMessage({
      message: "复制失败",
      type: "error",
      duration: 1500,
    });
    console.error("复制失败:", error);
  }
};

let clipboardInterval = null as any;
let lastContent = "";

onMounted(async () => {
  // 读取初始剪贴板内容
  const initialContent = await readText();
  if (initialContent) {
    textList.value.push({
      content: initialContent,
      timestamp: formatTime(new Date()),
    });
    lastContent = initialContent;
  }

  // 设置定时轮询剪贴板变化（每1000ms检查一次）
  clipboardInterval = setInterval(async () => {
    try {
      const currentContent = await readText();
      if (currentContent && currentContent !== lastContent && !textList.value.includes(currentContent)) {
        textList.value.unshift({
          content: currentContent,
          timestamp: formatTime(new Date()),
        });
        if (textList.value.length > 10) {
          textList.value.pop();
        }
        lastContent = currentContent;
      }
    } catch (error: any) {
      console.error("读取剪贴板失败:", error);
    }
  }, 1000) as any;
});

onUnmounted(() => {
  // 清除定时器
  if (clipboardInterval) {
    clearInterval(clipboardInterval);
  }
});
</script>

<style lang="scss" scoped>
.page-main.clipboard {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.clipboard-history {
  //background-color: #f5f5f5;
  background-color: #f5f5f5;
  border-radius: 8px;
  height: 100%;
}

.history-list {
  overflow-y: auto;
  height: 100%;
}

.history-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-all;
  cursor: pointer;
}

.timestamp {
  color: #888;
  font-size: 15px;
  margin-bottom: 4px;
  font-family: monospace;
}

.content {
  margin-top: 4px;
}

.json-editor {
  border-radius: 4px;
  height: calc(100% - 300px);
  min-height: 200px;
}

.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  margin-top: 15px;
}
</style>
