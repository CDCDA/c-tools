/*
 * @Description:登录用户数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
export const useSettingStore = defineStore("setting", () => {
  const dataSavePath = ref("D:/c-tools-data");
  return {
    dataSavePath,
  };
});

export default useSettingStore;
