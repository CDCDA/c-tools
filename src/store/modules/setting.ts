/*
 * @Description:登录用户数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
export const useSettingStore = defineStore("setting", () => {
  const dataSavePath = ref("D:/c-tools-data");
  const transparent = ref(false);
  const visible = ref(true);
  return {
    dataSavePath,
    transparent,
    visible,
  };
});

export default useSettingStore;
