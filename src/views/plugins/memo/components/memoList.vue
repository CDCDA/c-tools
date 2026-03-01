<template>
  <div class="memo-list">
    <List
      :list="props.memoList"
      @update:selectIds="updateSelectIds"
      ref="listRef"
      @dbClick="handleDbClick"
      @batchDelete="handleBatchDelete"
    >
      <template #default="{ item }">
        <div class="memo-list-item">
          <!-- 1. 在父容器上绑定双击事件 -->
          <div
            class="editor-content-view"
            v-html="item.content"
            @click="handleClick"
          ></div>
          <div class="memo-title flex-between">
            <div class="title">{{ item.title }}</div>
            <div class="tools">
              <svg-icon
                iconName="otherSvg-编辑"
                class="svg-btn"
                @click="emit('openMemoDrawer', 'edit', item)"
              />
              <svg-icon
                iconName="otherSvg-删除"
                class="svg-btn"
                @click="emit('deleteMemo', item)"
              />
            </div>
          </div>
        </div>
      </template>
    </List>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { copyImgToClipboard } from "@/utils/clipboard.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
import { ElNotification } from "element-plus";
const emit = defineEmits([
  "update:selectIds",
  "submitMemo",
  "deleteMemo",
  "openMemoDrawer",
]);
const props = defineProps({
  memoList: {
    type: Array as any,
    default: () => [],
  },
  mode: {
    type: String,
    default: "single",
  },
  selectIds: {
    type: Array as any,
    default: () => [],
  },
});

const handleBatchDelete = (item: any) => {
  emit("deleteMemo", item);
};

const updateSelectIds = (ids: any) => {
  emit("update:selectIds", ids);
};

const handleDbClick = async (item: any) => {
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
const listRef = ref(null) as any;

defineExpose({
  getSelectIds: () => listRef.value.getSelectIds(),
});
</script>

<style lang="scss" scoped>
.memo-list {
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: 10px 10px 10px 0;
  flex: 1;
  margin-left: 155px;
  margin-right: 5px;
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;

  :deep(.c-list) {
    width: 100%;

    .c-list-item {
      position: relative;

      .memo-list-item {
        max-height: 220px;
        border-radius: 6px;
        // border: 2px solid #EBEBEB;
        cursor: pointer;
        // margin-bottom: 10px;
        width: calc(100% - 5px);
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: start;

        .editor-content-view {
          height: calc(100% - 32px);
          overflow: auto;
          font-family: Consolas;
          z-index: 10;

          p {
            margin: 0 !important;
            padding: 5px !important;
            border-radius: 3px;

            &:hover {
              background: #4647471a !important;
              // color: #fff !important;
            }

            img {
              border-radius: 4px !important;
            }
          }
        }

        .memo-title {
          width: calc(100% - 8px);
          // border-top: 1px solid #EBEBEB;
          margin-top: 10px;
          font-size: 15px;
          color: #666666;
          padding: 4px 4px 0px 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .tools {
            width: fit-content;
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;

            .svg-icon {
              width: 16px;
              height: 16px;
              margin: 0 2px;
            }
          }
        }
      }

      &:hover .memo-title .tools {
        visibility: visible !important;
      }

      //   .memo-list-item:last-child {
      //     margin-bottom: 0;
    }
  }
}
</style>
