/*
 * @Description:登录用户数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { registerShortcut } from "@/utils/shortcut.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { saveStoreData, getStoreData } from "@/utils/localSave.ts";
export const useSettingStore = defineStore(
  "setting",
  () => {
    // 数据保存路径
    const savePath = ref("D:\\c-tools-data");
    // 备份路径
    const backupPath = ref("D:\\c-tools-data-backup");
    // 主窗口快捷键
    const shortCutKey = ref("Alt+Space");
    // 开机启动
    const autoStart = ref(true);
    // 分离为独立窗口快捷键
    const separateWindowShortCutKey = ref("Ctrl+Shift+Space");
    // 透明
    const transparent = ref(false);
    // 可见
    const visible = ref(true);
    const saveStore = () => {
      saveStoreData("setting", {
        transparent: transparent.value,
        visible: visible.value,
        backupPath: backupPath.value,
        shortCutKey: shortCutKey.value,
        autoStart: autoStart.value,
        separateWindowShortCutKey: separateWindowShortCutKey.value,
      });
    };
    const loadStore = async () => {
      const data = (await getStoreData("setting")) as any;
      if (data) {
        transparent.value = false;
        visible.value = data.visible;
        backupPath.value = data.backupPath;
        shortCutKey.value = data.shortCutKey;
        autoStart.value = data.autoStart;
        separateWindowShortCutKey.value = data.separateWindowShortCutKey;
      }
      const currentWindow = await getCurrentWindow();
      if (currentWindow.label === "main") {
        console.log("注册主窗口快捷键");
        await registerShortcut({
          shortcut: shortCutKey.value,
          event: () => {
            currentWindow.show();
            currentWindow.setFocus();
          },
        });
      }
    };

    return {
      savePath,
      transparent,
      visible,
      backupPath,
      shortCutKey,
      autoStart,
      separateWindowShortCutKey,
      saveStore,
      loadStore,
    };
  },
  {
    persist: true, // 开启持久化
  },
);

export default useSettingStore;
