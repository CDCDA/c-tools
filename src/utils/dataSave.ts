import { useSettingStore } from "@/store/modules/setting.ts";
import { useUserStore } from "@/store/modules/user.ts";
import { write, read, list } from "./file";

export const saveData = (pluginName: string, fileName: string, data: any, type?: string) => {
  let { userName } = useUserStore();
  if (!userName) {
    userName = "common";
  }
  const { savePath } = useSettingStore();
  if (type === "date") {
    fileName = `${fileName}-${new Date().getTime()}`;
  }

  const filePath = `${savePath}/${userName}/${pluginName}/${fileName}.json`;
  console.log("filePath", filePath);
  write(filePath, JSON.stringify(data));
};

export const getData = async (pluginName: string, fileName: string, type?: string) => {
  let { userName } = useUserStore();
  if (!userName) {
    userName = "common";
  }
  const { savePath } = useSettingStore();
  if (type === "date") {
    fileName = `${fileName}-${new Date().getTime()}`;
  }
  if (type === "user") {
    fileName = `${fileName}.json`;
  }
  const filePath = `${savePath}/${userName}/${pluginName}/${fileName}.json`;
  try {
    console.log("getPath", filePath);
    const data = await read(filePath);
    if (!data) {
      return null;
    }
    return JSON.parse(data as any);
  } catch (error: any) {
    console.error(`【${filePath}】:`, error);
    return null;
  }
};

export const getPluginData = async (pluginName: string) => {
  let { userName } = useUserStore();
  if (!userName) {
    userName = "common";
  }
  const { savePath } = useSettingStore();
  const fileDir = `${savePath}/${userName}/${pluginName}`;
  const fileList = (await list(fileDir)) as any;
  const dataList = await Promise.all(
    fileList.map(async (item: any) => {
      return await read(item.path);
    })
  );
  return dataList;
};
