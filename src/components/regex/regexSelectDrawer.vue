<template>
  <el-drawer
    v-model="isOpen"
    title="选择正则方案"
    size="360px"
    :with-header="false"
    direction="rtl"
    @close="closeDrawer"
  >
    <div class="drawer-inner">
      <div class="drawer-header">
        <h3>模型设置</h3>
      </div>
      <el-form :model="selectedModel" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="模型名称" prop="modelName">
          <el-select v-model="selectedModel.modelId" placeholder="请选择模型名称" @change="handleModelChange">
            <el-option
              v-for="model in modelList"
              :key="model.modelId"
              :label="model.modelName"
              :value="model.modelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提示语" prop="message">
          <el-input
            v-model="selectedModel.message"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入提示语"
          />
        </el-form-item>
      </el-form>

      <div class="drawer-footer">
        <el-button @click="closeDrawer">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :loading="isLoading">确认</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAiStore } from "../../store/modules/ai";
const aiStore = useAiStore();
const rules = ref({
  modelName: [{ required: true, message: "请选择模型名称", trigger: ["blur"] }],
  message: [{ required: true, message: "请输入提示语", trigger: ["blur"] }],
});
const formRef = ref<any>(null);

const props = defineProps<{
  isOpen: boolean;
  selectedModel?: any;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  setModel: [value: any];
}>();

const handleModelChange = (modelId: string) => {
  const selectedModelData = modelList.value.find((item) => item.modelId === modelId);
  selectedModel.value = selectedModelData;
  // if (selectedModelData) {
  //   formData.value.modelName = selectedModelData.modelName;
  // }
};

const isOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit("update:isOpen", value),
});

// 本地状态，基于props初始化
const selectedModel = ref(props.selectedModel || aiStore.getDefaultModel()?.modelId);
const isLoading = ref(false);

// 获取store中的模型列表
const modelList = ref<any[]>([]);

// 加载模型列表
const loadModels = () => {
  modelList.value = aiStore.getModelList();
};

// 监听props变化，更新本地状态
watch(
  () => props.selectedModel,
  (newVal) => {
    if (newVal) {
      selectedModel.value = newVal;
    }
  }
);

// 监听isOpen变化，加载模型数据
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadModels();
    }
  }
);

const closeDrawer = () => {
  emit("update:isOpen", false);
};

const confirmSelection = async () => {
  isLoading.value = true;
  try {
    // 设置默认模型
    const selectedModelData = modelList.value.find((item) => item.modelId === selectedModel.value);
    if (selectedModelData) {
      aiStore.setDefaultModel(selectedModelData);
    }
    // 发送选择事件
    emit("setModel", selectedModel.value);
    closeDrawer();
  } catch (error: any) {
    console.error("确认模型选择失败", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  /* padding: 16px 0; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.el-form {
  padding: 10px;
}

.drawer-footer {
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
