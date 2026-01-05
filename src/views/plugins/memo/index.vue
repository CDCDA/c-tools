<template>
  <div class="page-main meno">
    <el-menu
      default-active="2"
      class="memo-type"
      style="width: 140px; height: 100%"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-menu-item v-for="item in typeList" :key="item.value" :index="item.value">
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
    <div class="memo-list">
      <div
        v-for="item in memoList"
        :key="item.value"
        :class="['memo-list-item', { active: item.value === activeType }]"
      >
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { writeText, readText } from "@tauri-apps/plugin-meno-manager";
import { ElMessage } from "element-plus";
import { currentWindow } from "@/utils/window.ts";
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
const memoList = ref([]);

function addType(type) {
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
.page-main.meno {
  padding: 0px;
  height: 100%;
  width: 100%;
}
</style>
