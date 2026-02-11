/*
 * @Description:登录用户数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
export const useSettingStore = defineStore(
  "setting",
  () => {
    // 数据保存路径
    const savePath = ref("D:\\c-tools-data");
    // 备份路径
    const backupPath = ref("D:\\c-tools-data-backup");
    // 开机启动
    const autoStart = ref(true);
    // 透明
    const transparent = ref(false);
    // 可见
    const visible = ref(true);
    const saveStore = () => {
      saveStoreData("setting", {
        transparent: transparent.value,
        visible: visible.value,
        backupPath: backupPath.value,
        autoStart: autoStart.value,
      });
    };
    const loadStore = async () => {
      const data = (await getStoreData("setting")) as any;
      if (data) {
        transparent.value = false;
        visible.value = data.visible;
        backupPath.value = data.backupPath;
        autoStart.value = data.autoStart;
      }
    };

    return {
      savePath,
      transparent,
      visible,
      backupPath,
      autoStart,
      saveStore,
      loadStore,
    };
  },
  {
    persist: true, // 开启持久化
  },
);

export default useSettingStore;
