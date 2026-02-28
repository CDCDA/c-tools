<template>
  <div class="account-manage">
    <div class="account-manage-user">
      <div class="login">
        <div class="user-icon-box login-left" v-if="!userStore.token">
          <svg-icon iconName="otherSvg-用户" class="user-icon"></svg-icon>
        </div>
        <div class="user-img-box login-left" v-else>
          <el-avatar :src="userStore.avatar" class="user-img"></el-avatar>
        </div>
        <div class="login-right" v-if="!userStore.token">
          <div class="user-login" @click="initLoginDialog">
            请登录 <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="user-tip">不登录数据存本地，换设备记得迁移数据</div>
        </div>
        <div class="login-right" v-else>
          <div class="user-name">{{ userStore.userName }}</div>
          <div class="user-email">
            <span></span>{{ userStore.email }} |
            <span>cTools已陪伴你 {{ getTimeDiff(userStore.createTime, new Date(), "day") }} 天</span>
          </div>
        </div>
      </div>
    </div>
    <LoginDialog ref="loginDialogRef" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/store/modules/user.ts";
import { ArrowRight } from "@element-plus/icons-vue";
import LoginDialog from "./loginDialog.vue";
import { getTimeDiff } from "@/utils/date.ts";
const loginDialogRef = ref(null) as any;

const userStore = useUserStore();
// 登录弹窗初始化
function initLoginDialog() {
  loginDialogRef.value?.init();
}

// import { ref } from "vue";
// import { useRouter } from "vue-router";
// const router = useRouter();
// const menuList = ref<any>([]);
// const defaultActive = ref<any>("");
</script>
<style scoped lang="scss">
.account-manage {
  width: 100%;
  padding: 20px;
}
.account-manage-user {
  border-radius: 4px;
  background: linear-gradient(90deg, #d6d6d6 0%, #b7b7b7 100%);
  width: calc(100% - 40px);
  padding: 10px 20px;

  .login {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: start;
    .login-left {
      width: fit-content;
      margin-right: 20px;
    }
    .login-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: start;
      flex-direction: column;
      .user-login,
      .user-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: start;
        cursor: pointer;
      }
      .el-icon {
        margin-top: 2px;
        font-size: 22px;
      }
      .user-tip,
      .user-email {
        font-size: 15px;
        color: #717172;
      }
      div {
        text-align: left;
        width: 100%;
      }
    }
    .user-icon-box {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: black;
      .user-icon {
        width: 40px;
        height: 40px;
        fill: #252526;
      }
    }
    .user-img-box {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: black;
      .user-img {
        width: 100%;
        height: 100%;
        fill: #252526;
      }
    }
  }
}
</style>
