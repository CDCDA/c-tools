<template>
  <div class="page-main memo">
    <div class="memo-bar-container">
      <el-menu
        default-active="2"
        class="memo-bar"
        style="width: 140px; height: 100%"
      >
        <el-menu-item
          v-for="item in typeList"
          :key="item.value"
          :index="item.value"
        >
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="menu-footer">
        <el-button-group>
          <el-button type="primary" :icon="Plus" size="mini">新增</el-button>
          <el-button type="danger" :icon="Delete" size="mini">删除</el-button>
        </el-button-group>
      </div>
    </div>

    <div class="memo-list">
      <div
        v-for="item in memoList"
        :key="item.value"
        @click="currentMemo = item"
        :class="['memo-list-item', { active: item.id === currentMemo.id }]"
      >
        <WangEditor v-model="item.content" />
        <span>{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { writeText, readText } from "@tauri-apps/plugin-memo-manager";
import { ElMessage } from "element-plus";
import { currentWindow } from "@/utils/window.ts";
import WangEditor from "@/components/wangEditor/index.vue";

const currentMemo = ref<any>({});
const typeList = ref([
  {
    label: "全部",
    value: "all",
  },
]);

const activeType = ref("all");
const totalMemoList = ref([
  {
    id: 1,
    label: "全部",
    type: "all",
  },
]);
const memoList = ref<any>([
  {
    id: 1,
    shortCut: "CTRL+P",
    content: "123\n2123",
    title: "123",
    type: "1",
  },
]);

function addType(type: any) {
  typeList.value.push(type);
}

const addMemo = (memo: any) => {
  totalMemoList.value.push(memo);
  if (memo.type === activeType.value || activeType.value === "all") {
    memoList.value.push(memo);
  }
};

onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.page-main.memo {
  padding: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  .memo-bar-container {
    height: 100%;
    width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .menu-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: calc(100% - 0px);
      .el-button {
        width: 50%;
        border-radius: 0;
      }
    }
    .memo-bar {
      height: 100%;
    }
  }
  .memo-list {
    display: flex;
    flex-direction: column;
    height: calc(100% - 40px);
    padding: 20px;
    flex: 1;
    .memo-list-item {
      padding: 0 20px;
      border-radius: 6px;
      border: 2px solid #d5d7dd;
      cursor: pointer;
      &.active {
        border-color: var(--el-color-primary);
      }
    }
  }
}
</style>
