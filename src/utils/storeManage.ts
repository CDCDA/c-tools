import { useUserStore } from "@/store/modules/user.ts";
import { useDatabaseStore } from "@/store/modules/database.ts";
import { useAiStore } from "@/store/modules/ai.ts";
import { useShortcutStore } from "@/store/modules/shortcut.ts";
import { useSettingStore } from "@/store/modules/setting.ts";
import { usePluginConfigStore } from "@/store/modules/pluginConfig.ts";
import { useRouter } from "vue-router";
export const useStoreManage = () => {
  const userStore = useUserStore();
  const databaseStore = useDatabaseStore();
  const aiStore = useAiStore();
  const shortcutStore = useShortcutStore();
  const settingStore = useSettingStore();
  const pluginConfigStore = usePluginConfigStore();
  return {
    userStore,
    databaseStore,
    aiStore,
    shortcutStore,
    settingStore,
    pluginConfigStore,
  };
};

export const saveAllStore = () => {
  const { userStore, databaseStore, aiStore, shortcutStore, settingStore, pluginConfigStore } = useStoreManage();
  userStore.saveStore();
  databaseStore.saveStore();
  aiStore.saveStore();
  shortcutStore.saveStore();
  settingStore.saveStore();
  pluginConfigStore.saveStore();
};

export const loadAllStore = (initShortCut: boolean) => {
  const { userStore, databaseStore, aiStore, shortcutStore, settingStore, pluginConfigStore } = useStoreManage();
  userStore.loadStore();
  databaseStore.loadStore();
  aiStore.loadStore();
  settingStore.loadStore();
  pluginConfigStore.loadStore();
  initShortCut ? shortcutStore.loadStore(useRouter()) : null;
};
