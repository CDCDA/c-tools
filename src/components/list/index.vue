<template>
  <div class="c-list">
    <el-empty v-if="list.length === 0" image="" image-style="height: 100px" description="暂无数据" />
    <div v-for="(item, index) in list" :key="item.id || index" class="c-list-item" @click="handleSelect(item)"
      @dblclick="handleDbClick(item)">
      <slot :item="item" :index="index">
        <!-- 默认内容使用c-list的结构 -->
        <div class="c-list-item-content">{{ item.content }}</div>
        <div class="c-title flex-between">
          <div class="title">{{ item.title }}</div>
          <div class="tools">
            <el-icon @click="$emit('edit', item)">
              <Edit />
            </el-icon>
            <el-icon @click="$emit('delete', item)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'single'
  },
  selectcs: {
    type: Array,
    default: () => []
  },
  currentc: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["update:selectcs", "edit", "delete"]);

const handleSelect = (item: any) => {
  if (props.mode === 'multi') {
    let cs = [...props.selectcs];
    if (cs.find((c: any) => c.id === item.id)) {
      cs = cs.filter((c: any) => c.id !== item.id);
    } else {
      cs.push(item);
    }
    emit("update:selectcs", cs);
  } else {
    emit("update:selectcs", [item]);
  }
};

const handleDbClick = async (item: any) => {
  console.log("double click", item);
  writeText(item.text || item.content);
  ElMessage.success("已复制到剪贴板");
};

const handleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const pElement = target.closest("p");
  if (!pElement) {
    return;
  }
  const img = pElement.querySelector("img");
  if (img) {
    // 这里可以添加复制图片的逻辑
    ElMessage.success("已复制图片到剪贴板");
    return;
  }
  if (pElement) {
    const text = pElement.innerText;
    writeText(text);
    ElMessage.success("已复制到剪贴板");
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

.c-list-item {
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
.c-list {
  display: flex;
  flex-direction: column;
  height: fit-content;
  // padding: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;

  .c-list-item {
    max-height: 150px;
    border-radius: 6px;
    border: 2px solid #d5d7dd;
    cursor: pointer;
    margin-bottom: 10px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: start;

    .editor-content-view {
      height: calc(100% - 32px);
      overflow: auto;
    }

    .c-title {
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

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .c-list-item:last-child {
    margin-bottom: 0;
  }
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>