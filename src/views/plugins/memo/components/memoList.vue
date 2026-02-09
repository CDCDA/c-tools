<template>
  <div class="memo-list">
    <el-empty v-if="memoList.length === 0" image="" image-style="height: 100px" description="暂无数据" />
    <div v-for="item in memoList" :key="item.value" @click="handleSelect(item)" @dblclick="handleDbClick(item)"
      :class="['memo-list-item', { active: item.id === currentMemo?.id || props.selectMemos.find((memo: any) => memo.id === item.id) }]">
      <!-- 1. 在父容器上绑定双击事件 -->
      <div class="editor-content-view" v-html="item.content" @click="handleClick"></div>
      <div class="memo-title flex-between">
        <div class="title">{{ item.title }}</div>
        <div class="tools">
          <el-icon @click="emit('openMemoDrawer', 'edit', item)">
            <Edit />
          </el-icon>
          <el-icon @click="emit('deleteMemo', item)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MemoDrawer from "@/views/plugins/memo/components/memoDrawer.vue";
import { invoke } from "@tauri-apps/api/core";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { copyImgToClipboard } from "@/utils/clipboard";
import { Edit, Delete } from "@element-plus/icons-vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
import { ElMessage } from "element-plus";
const emit = defineEmits(["update:selectMemos", "submitMemo", "deleteMemo", "openMemoDrawer"]);
const props = defineProps({
  memoList: {
    type: Array as any,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'single',
  },
  selectMemos: {
    type: Array as any,
    default: () => [],
  }
});

const handleSelect = (item: any) => {
  if (props.mode === 'multi') {
    let memos = [...props.selectMemos];
    if (memos.find((memo: any) => memo.id === item.id)) {
      memos = memos.filter((memo: any) => memo.id !== item.id);
    } else {
      memos.push(item);
    }
    emit("update:selectMemos", memos);

  } else {
    emit("update:selectMemos", [item]);
  }

}
const handleDbClick = async (item: any) => {
  console.log("click", item);
  // 模拟双击事件
  currentWindow.hide();
  writeText(item.text);
  await invoke("paste", { text: item.text });
};

const handleClick = (event: MouseEvent) => {

  const target = event.target as HTMLElement;
  const pElement = target.closest("p");
  if (!pElement) {
    return;
  }
  const img = pElement.querySelector("img");
  if (img) {
    copyImgToClipboard(img.src);
    ElNotification.success("已复制图片到剪贴板");
    return;
  }
  if (pElement) {
    const text = pElement.innerText; // 获取文本内容
    writeText(text);
    ElNotification.success("已复制到剪贴板");
  }
};

</script>

<style lang="scss">
/* 建议加上这个样式，增加可交互提示感 */
.editor-content-view p {
  cursor: pointer;
  user-select: none;
  /* 防止双击时选中文本干扰视觉 */
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(var(--el-color-primary-rgb), 0.1);
  }
}
</style>
<style lang="scss">
.memo-list-item {


  p {
    margin: 0 !important;
    padding: 5px !important;
    border-radius: 3px;

    img {
      border-radius: 4px !important;
    }

    &:hover {
      background-color: #c5c5c5 !important;
      color: #fff !important;
    }
  }
}
</style>
<style lang="scss" scoped>
.memo-list {
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: 10px;
  flex: 1;
  margin-left: 155px;
  margin-right: 66px;
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;

  .memo-list-item {
    max-height: 220px;
    border-radius: 6px;
    border: 2px solid #d5d7dd;
    cursor: pointer;
    margin-bottom: 10px;
    width: calc(100% - 5px);
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: start;

    .editor-content-view {
      height: calc(100% - 32px);
      overflow: auto;
    }

    .memo-title {
      width: calc(100% - 8px);
      border-top: 1px dashed #d5d7dd;
      margin-top: 10px;
      font-size: 15px;
      color: #756e6e;
      padding: 4px 4px 0px 4px;

      .tools {
        width: fit-content;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 16px;
          margin-left: 10px;
        }
      }
    }

    &.active,
    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .memo-list-item:last-child {
    margin-bottom: 0;
  }
}
</style>
