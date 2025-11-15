import { useSettingStore } from "@/store/modules/setting.ts";
import { useUserStore } from "@/store/modules/user.ts";
import { write, read, list } from "./file";
const { dataSavePath } = useSettingStore();
const { userName } = useUserStore();
export const saveData = (pluginName: string, fileName: string, data: any, type?: string) => {
  if (type === "date") {
    fileName = `${fileName}-${new Date().getTime()}`;
  }

  const filePath = `${dataSavePath}/${userName}/${pluginName}/${fileName}.json`;
  console.log("filePath", filePath);
  write(filePath, JSON.stringify(data));
};

export const getData = async (pluginName: string, fileName: string, type?: string) => {
  if (type === "date") {
    fileName = `${fileName}-${new Date().getTime()}`;
  }
  if (type === "user") {
    fileName = `${fileName}.json`;
  }
  const filePath = `${dataSavePath}/${userName}/${pluginName}/${fileName}`;
  const data = await read(filePath);
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data as any);
  } catch (error) {
    return null;
  }
};

export const getPluginData = async (pluginName: string) => {
  const fileDir = `${dataSavePath}/${userName}/${pluginName}`;
  const fileList = (await list(fileDir)) as any;
  const dataList = await Promise.all(
    fileList.map(async (item: any) => {
      return await read(item.path);
    })
  );
  return dataList;
};
