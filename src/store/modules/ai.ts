/*
 * @Description:AI模型数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { getStoreData, saveStoreData } from "@/utils/localSave.ts";
const useAiStore = defineStore(
  "ai",
  () => {
    const modelList = ref([
      {
        apiKey: "sk-e1HIH7pyEhMjxfV8A1oEK5VOCxKoXORiHwuLikXJo8jZr1MZ",
        baseUrl: "https://api.moonshot.cn/v1",
        modelName: "KIMI",
        modelId: "moonshot-v1-8k",
      },
    ]);
    const defaultModel = ref({
      apiKey: "sk-e1HIH7pyEhMjxfV8A1oEK5VOCxKoXORiHwuLikXJo8jZr1MZ",
      baseUrl: "https://api.moonshot.cn/v1",
      modelName: "KIMI",
      modelId: "moonshot-v1-8k",
    });
    const setDefaultModel = (model: any) => {
      defaultModel.value = model;
    };
    const getDefaultModel = () => {
      return defaultModel.value;
    };
    const getModelList = () => {
      return modelList.value;
    };
    const addModel = (model: any) => {
      modelList.value.push(model);
    };
    const updateModel = (model: any) => {
      modelList.value = modelList.value.map((item: any) => (item.modelId === model.modelId ? model : item));
    };
    const removeModel = (model: any) => {
      modelList.value = modelList.value.filter((item: any) => item !== model);
    };
    const setModelList = (modelList: any) => {
      modelList.value = modelList;
    };
    const getModel = (modelId: string) => {
      return modelList.value.find((item: any) => item.modelId === modelId);
    };
    const getModelName = (modelId: string) => {
      return modelList.value.find((item: any) => item.modelId === modelId)?.modelName;
    };
    const getModelApiKey = (modelId: string) => {
      return modelList.value.find((item: any) => item.modelId === modelId)?.apiKey;
    };
    const getModelBaseUrl = (modelId: string) => {
      return modelList.value.find((item: any) => item.modelId === modelId)?.baseUrl;
    };
    const saveStore = () => {
      saveStoreData("ai", {
        modelList: modelList.value,
        defaultModel: defaultModel.value,
      });
    };
    const loadStore = async () => {
      const data = (await getStoreData("ai")) as any;
      if (data) {
        modelList.value = data.modelList;
        defaultModel.value = data.defaultModel;
      }
    };

    return {
      modelList,
      defaultModel,
      setDefaultModel,
      getModelList,
      updateModel,
      getDefaultModel,
      addModel,
      removeModel,
      setModelList,
      getModel,
      getModelName,
      getModelApiKey,
      getModelBaseUrl,
      saveStore,
      loadStore,
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export { useAiStore };
