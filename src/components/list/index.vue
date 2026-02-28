<template>
  <div class="c-list">
    <el-empty v-if="list.length === 0" image="" image-style="height: 100px" description="暂无数据" />
    <div v-for="(item, index) in list" :key="item.id || index"
      :class="['c-list-item', { active: selectIds.includes(item.id) }]" @click="(e) => handleSelect(e, item)"
      @dblclick="handleDbClick(item)">
      <slot :item="item" :index="index">
      </slot>
    </div>
    <!-- 批量删除按钮 -->

    <svg-icon iconName="otherSvg-删除" class="svg-btn" v-if="selectIds.length > 1" @click="handleBatchDelete" />

  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
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
  selectIds: {
    type: Array,
    default: () => []
  },
  currentItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["update:selectIds", "dbClick", "oneClick", "batchDelete"]);

const selectIds = ref(props.selectIds);

// 监听selectIds变化
watch(() => props.selectIds, (newVal) => {
  selectIds.value = newVal;
}, { deep: true });

const handleSelect = (event: MouseEvent, item: any) => {
  // 检查是否按下了Ctrl键
  const isCtrlPressed = event.ctrlKey || event.metaKey; // metaKey for Mac

  if (props.mode === 'multi' || isCtrlPressed) {
    let newSelectIds = [...selectIds.value];
    if (newSelectIds.includes(item.id)) {
      // 如果已选中，则移除
      newSelectIds = newSelectIds.filter(id => id !== item.id);
    } else {
      // 如果未选中，则添加
      newSelectIds.push(item.id);
    }
    selectIds.value = newSelectIds;
    emit('update:selectIds', newSelectIds);
  } else {
    // 单选模式
    selectIds.value = [item.id];
    emit('update:selectIds', [item.id]);
  }
  emit('oneClick', item);
};

const handleDbClick = async (item: any) => {
  emit("dbClick", item);
};

const handleBatchDelete = () => {
  emit("batchDelete", selectIds.value);
};
defineExpose({
  getSelectIds: () => selectIds.value,
});
</script>
<style lang="scss" scoped>
.c-list {
  display: flex;
  flex-direction: column;
  height: fit-content;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: auto;
  position: relative;

  .c-list-item {

    border-radius: 6px;
    background: white;
    cursor: pointer;
    margin-bottom: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
    position: relative;

    &:hover,
    &.active {
      // background-color: rgba(0, 150, 140, 0.1);
    }

    &.active::before,
    &:hover::before {
      content: '';
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      border-radius: 6px;
      border: 2px solid var(--el-color-primary);
    }
  }

  .c-list-item:last-child {
    margin-bottom: 0;
  }

  // 批量删除按钮
  .svg-btn {
    position: fixed;
    bottom: 10%;
    right: 20px;
    background: #ccc !important;
    color: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: slideInFromRight 0.3s ease-out forwards;
    z-index: 10;

  }

  // 从右到左移入动画
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}
</style>