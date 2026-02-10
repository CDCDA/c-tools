<!--
 * @Description: 插件管理页侧边栏
-->
<template>
  <div class="sidebar">
    <div class="sidebar-menu">
      <div class="menu-item">
        <div class="menu-item-label">{{ `插件列表(${pluginData.length})` }}</div>
        <div class="sub-menu-item" :class="defaultActive == plugin.id ? 'active' : ''" v-for="(plugin, i) in pluginList"
          :key="plugin.id" @click="menuClick(plugin)" :style="i == 0 ? 'margin-top: 0 !important' : ''">
          <svg-icon :iconName="plugin.meta.icon" /><span class="sub-menu-item-label">{{ plugin.meta?.label ||
            plugin.name }}</span>
        </div>
      </div>
    </div>

    <!-- 个人中心 -->
    <div class="personal" @click="toPersonalCenter">
      <div class="personal-content">
        <div class="personal-left">
          <div class="user-icon-box" v-if="!userStore.token">
            <svg-icon iconName="otherSvg-用户" class="user-icon"></svg-icon>
          </div>
          <div class="user-img-box" v-else>
            <el-avatar :src="userStore.avatar" class="user-img"></el-avatar>
          </div>
        </div>
        <div class="personal-right">
          <div class="personal-title">个人中心</div>
          <div class="personal-name">{{ userStore.userName || '未登录' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user.ts";
import { pluginData } from "@/utils/plugin.ts";
const router = useRouter();
const pluginList = ref([] as any);
const defaultActive = ref(0);
const userStore = useUserStore();

function menuClick(plugin: any) {
  defaultActive.value = plugin.id;
  console.log("插件点击:", defaultActive.value);

  // 跳转到插件配置页面，传递插件ID
  router.push({ name: "pluginConfig", params: { id: plugin.id } });
}
function toPersonalCenter() {
  router.push({ name: "manage" });
}
onMounted(() => {
  // 从pluginData获取插件列表
  pluginList.value = pluginData;
  console.log("插件列表:", pluginList.value);

  // 设置默认激活项
  if (pluginList.value.length > 0) {
    defaultActive.value = pluginList.value[0].id;
    router.push({ name: "pluginConfig", params: { id: defaultActive.value } });
  }
});
</script>
<style lang="scss" scoped>
.sidebar {
  width: 250px;
  border-right: 1px solid #d5d7dd;
  height: calc(100% - 51px);
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  flex: 1;
  padding: 0px 6px 10px 6px;
  background: #f5f7fa;
  overflow-y: auto;
  height: calc(100% - 50px);

  .sub-menu-item,
  .menu-item-label {
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 0 10px;
    font-size: 13px;
  }

  .menu-item-label {
    height: 35px;
    font-size: 14px;
    color: #333;
  }

  .sub-menu-item {
    font-size: 15px;
    cursor: pointer;
    position: relative;
  }

  .sub-menu-item-label {
    margin-bottom: 2px;
  }

  .active {
    background: #eaedef;
    border-radius: 4px;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 4px;
      height: 100%;
      background-color: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  .svg-icon {
    height: 20px;
    width: 20px;
    margin-right: 10px;
  }

  .sub-menu-item {
    margin: 0;
  }
}

// 个人中心样式
.personal {
  border-top: 1px solid #d5d7dd;
  padding: 5px 10px;
  height: 42px;
  cursor: pointer;
  background: #ffffff;

  .personal-content {
    display: flex;
    align-items: center;

    .personal-left {
      margin-right: 15px;
    }

    .personal-right {
      flex: 1;

      .personal-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 0px;
      }

      .personal-name {
        font-size: 13px;
        color: #606266;
      }
    }

    .user-icon-box {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f0f0f0;

      .user-icon {
        width: 24px;
        height: 24px;
        fill: #606266;
      }
    }

    .user-img-box {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f0f0f0;

      .user-img {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.sidebar-menu.el-menu--collapse {
  min-width: initial;
}
</style>