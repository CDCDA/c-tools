<template>
  <div class="page-main">
    <div class="main-container">
      <div class="main-container-left">
        <database ref="databaseRef" v-model="database" />
      </div>
      <div class="main-container-right">
        <generatePlan ref="generatePlanRef" v-model="generatePlan" />
      </div>
    </div>

    <div class="tools">
      <div class="left-tools">
        <div class="time">
          生成耗时：<span
            >{{ (generateConsumingTime / 1000).toFixed(2) }}s</span
          >
        </div>
      </div>
      <div class="center-tools">{{ tips }}</div>
      <div class="right-tools"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Switch, Edit } from "@element-plus/icons-vue";
import { write, read, openFileDialog } from "@/utils/file.ts";
import { ElNotification } from "element-plus";
import { invoke } from "@tauri-apps/api/core";
import GeneratePlan from "./components/generatePlan.vue";
import Editor from "@/components/editor/index.vue";
import Database from "./components/database.vue";
const databaseRef = ref(null) as any;
const generateConsumingTime = ref(0);
const tips = ref("");
const database = ref({
  title: "MySQL",
  url: "MySQL",
});
const generatePlanRef = ref(null) as any;
const generatePlan = ref({}) as any;
</script>

<style lang="scss">
.page-main {
  .main-container {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: space-between;
    .main-container-left {
      width: calc(50% - 5px);
    }
    .main-container-right {
      width: calc(50% - 5px);
    }
  }
}
</style>
