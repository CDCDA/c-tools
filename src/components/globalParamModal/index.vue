<template>
  <el-dialog v-model="visible" title="快捷执行参数确认" width="400px" append-to-body>
    <el-form label-width="80px" v-if="activeScript">
      <el-form-item v-for="arg in activeScript.args" :key="arg.key" :label="arg.key">
        <el-input v-model="params[arg.key]" @keyup.enter="handleConfirm" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">立即执行</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { bus } from "@/utils/bus.ts";
import { executeScript } from "@/utils/shellExecutor.ts";

const visible = ref(false);
const activeScript = ref<any>(null);
const params = ref<Record<string, string>>({});

onMounted(() => {
  bus.on("show-global-param-dialog", (script: any) => {
    activeScript.value = script;
    params.value = {};
    script.args.forEach((arg: any) => {
      params.value[arg.key] = arg.defaultValue;
    });
    visible.value = true;
  });
});

const handleConfirm = () => {
  executeScript(activeScript.value, params.value);
  visible.value = false;
};
</script>