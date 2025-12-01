import { useUserStore } from "@/store/modules/user.ts";
import { useDatabaseStore } from "@/store/modules/database.ts";
import { useAiStore } from "@/store/modules/ai.ts";
import { useShortcutStore } from "@/store/modules/shortcut.ts";
import { useSettingStore } from "@/store/modules/setting.ts";

export const useStoreManage = () => {
  const userStore = useUserStore();
  const databaseStore = useDatabaseStore();
  const aiStore = useAiStore();
  const shortcutStore = useShortcutStore();
  const settingStore = useSettingStore();
  return {
    userStore,
    databaseStore,
    aiStore,
    shortcutStore,
    settingStore,
  };
};

export const saveAllStore = () => {
  const { userStore, databaseStore, aiStore, shortcutStore, settingStore } = useStoreManage();
  userStore.saveStore();
  databaseStore.saveStore();
  aiStore.saveStore();
  shortcutStore.saveStore();
  settingStore.saveStore();
};

export const loadAllStore = (initShortCut: boolean) => {
  const { userStore, databaseStore, aiStore, shortcutStore, settingStore } = useStoreManage();
  userStore.loadStore();
  databaseStore.loadStore();
  aiStore.loadStore();
  settingStore.loadStore();
  initShortCut ? shortcutStore.loadStore() : null;
};
