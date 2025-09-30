/*
 * @Description:AI模型数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
const useAiStore = defineStore("user", () => {
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
  // const getModelContextLength = (modelId: string) => {
  //   return modelList.value.find((item: any) => item.modelId === modelId)?.contextLength;
  // };

  return {
    modelList,
    defaultModel,
    setDefaultModel,
    getModelList,
    getDefaultModel,
    addModel,
    removeModel,
    setModelList,
    getModel,
    getModelName,
    getModelApiKey,
    getModelBaseUrl,
    // getModelContextLength,
  };
});

export { useAiStore };
