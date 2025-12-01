<template>
  <el-drawer v-model="open" title="AI模型" size="50%" direction="rtl" @close="close">
    <div class="drawer-content">
      <el-form :model="aiModel" ref="aiModelForm" label-width="80px" :rules="rules">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="aiModel.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型ID" prop="modelId">
          <el-input v-model="aiModel.modelId" placeholder="请输入模型ID" />
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="aiModel.apiKey" placeholder="请输入API Key" />
        </el-form-item>
        <el-form-item label="基础URL" prop="baseUrl">
          <el-input v-model="aiModel.baseUrl" placeholder="请输入Base URL" />
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <div class="drawer-footer-left">
        <el-button type="text" size="mini" @click="handleTestConnection">测试连接</el-button>
      </div>
      <div class="drawer-footer-right">
        <el-button type="primary" @click="handleSubmit">确定</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, reactive } from "vue";
import { sendMessage } from "@/api/ai.ts";
import { useAiStore } from "@/store/modules/ai.ts";
import { saveData } from "@/utils/dataSave.ts";
const aiStore = useAiStore();
const open = ref(false);
const emit = defineEmits(["update:aiModel"]);
const rules = reactive({
  modelName: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
  modelId: [{ required: true, message: "请输入模型ID", trigger: "blur" }],
  apiKey: [{ required: true, message: "请输入API Key", trigger: "blur" }],
  baseUrl: [{ required: true, message: "请输入Base URL", trigger: "blur" }],
});

const close = () => {
  open.value = false;
};

const action = ref("add") as any;

const init = (params: any) => {
  aiModel.value = params.aiModel;
  action.value = params.action;
  open.value = true;
};
const aiModelForm = ref(null) as any;
const aiModel = ref([]) as any;
function handleSubmit() {
  aiModelForm.value.validate((valid: boolean) => {
    if (valid) {
      if (action.value === "add") {
        aiStore.addModel(aiModel.value);
      } else {
        aiStore.updateModel(aiModel.value);
      }
      saveData("aiModel", "modelList", aiStore.modelList);
      close();
    } else {
      console.log("校验失败");
    }
  });
}
async function handleTestConnection() {
  const res = await sendMessage(
    [
      {
        role: "system",
        content: "你是人工智能助手",
      },
      {
        role: "user",
        content: "你使用的模型是什么",
      },
    ],
    aiModel.value
  );
  console.log(res);
  if (res.ok) {
    ElNotification.success({
      message: "连接测试成功",
    });
  } else {
    ElNotification.error({
      message: `连接测试失败:${res.statusText}`,
    });
  }
}

defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  .tools {
    margin-bottom: 10px;
  }
}
.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
