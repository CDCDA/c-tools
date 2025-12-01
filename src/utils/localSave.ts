import { useSettingStore } from "@/store/modules/setting.ts";
import { write, read } from "./file";

// 保存插件数据
export const savePluginData = (pluginName: string, data: any) => {
  const { savePath } = useSettingStore();
  if (!data || JSON.stringify(data) === "{}" || JSON.stringify(data) === "[]") return;
  const filePath = `${savePath}\\plugins\\${pluginName}\\index.json`;
  console.log("filePath", filePath);
  write(filePath, JSON.stringify(data));
};

// 获取插件数据
export const getPluginData = async (pluginName: string) => {
  const { savePath } = useSettingStore();
  const filePath = `${savePath}\\plugins\\${pluginName}\\index.json`;
  try {
    // console.log("getPath", filePath);
    const data = await read(filePath);
    return data ? JSON.parse(data as any) : null;
  } catch (error: any) {
    console.error(`【${filePath}】:`, error);
    return null;
  }
};

// 保存Store数据
export const saveStoreData = (storeName: string, data: any) => {
  const { savePath } = useSettingStore();
  if (!data || JSON.stringify(data) === "{}" || JSON.stringify(data) === "[]") return;
  const filePath = `${savePath}\\stores\\${storeName}\\index.json`;
  // console.log("StoreFilePath", filePath);
  write(filePath, JSON.stringify(data));
};

// 获取Sotre数据
export const getStoreData = async (storeName: string) => {
  const { savePath } = useSettingStore();
  const filePath = `${savePath}\\stores\\${storeName}\\index.json`;
  try {
    // console.log("getPath", filePath);
    const data = await read(filePath);
    return data ? JSON.parse(data as any) : null;
  } catch (error: any) {
    console.error(`【${filePath}】:`, error);
    return null;
  }
};
