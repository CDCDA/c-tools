/*
 * @Description:登录用户数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { getStoreData, saveStoreData } from "@/utils/localSave.ts";
import { verifyTokenNoIntercept } from "@/api/auth.ts";

export const useUserStore = defineStore(
  "user",
  () => {
    const userName = ref("");
    const avatar = ref("");
    const userId = ref("");
    const token = ref("");
    const nickName = ref("");
    const createTime = ref("");
    const email = ref("");
    const permission = ref([]) as any;
    const saveStore = () => {
      saveStoreData("user", {
        userName: userName.value,
        token: token.value,
        permission: permission.value,
        userId: userId.value,
        avatar: avatar.value,
        nickName: nickName.value,
        email: email.value,
        createTime: createTime.value,
      });
    };
    const loadStore = async () => {
      const data = (await getStoreData("user")) as any;
      if (data) {
        userName.value = data.userName;
        token.value = data.token;
        permission.value = data.permission;
        userId.value = data.userId;
        avatar.value = data.avatar;
        nickName.value = data.nickName;
        email.value = data.email;
        createTime.value = data.createTime;
      }
      const res = await verifyTokenNoIntercept(token.value);

      if (res.data.code !== 200) {
        clearStore();
        return;
      }
    };
    const clearStore = () => {
      userName.value = "";
      token.value = "";
      permission.value = [];
      userId.value = "";
      avatar.value = "";
      nickName.value = "";
      email.value = "";
      createTime.value = "";
    };
    return {
      userName,
      token,
      permission,
      userId,
      avatar,
      nickName,
      email,
      createTime,
      saveStore,
      loadStore,
      clearStore,
    };
  },
  {
    persist: true, // 开启持久化
  },
);

export default useUserStore;
