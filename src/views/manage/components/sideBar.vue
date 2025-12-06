<!--
 * @Description: 管理页侧边栏
-->
<template>
  <div class="sidebar">
    <div class="sidebar-menu">
      <div class="menu-item" v-for="item in menuList" :key="item.path">
        <div class="menu-item-label">{{ item.meta.label }}</div>
        <div
          class="sub-menu-item"
          :class="defaultActive == subItem.name ? 'active' : ''"
          v-for="subItem in item.children"
          :key="subItem.path"
          @click="menuClick(subItem)"
        >
          <svg-icon :iconName="subItem.meta.svgIcon" /><span class="sub-menu-item-label">{{ subItem.meta.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const menuList = ref([] as any);
const defaultActive = ref(0);
// import MenuItem from "@/views/manage/components/menuItem.vue";

function menuClick(item: any) {
  defaultActive.value = item.name;
  console.log(item.name);

  router.push({ name: item.name });
}

onMounted(() => {
  menuList.value = (router.options.routes as any).find((x: any) => x.name == "manage").children;
  console.log("11", menuList.value);
  defaultActive.value = menuList.value[0].name;
});
</script>
<style lang="scss" scoped>
.sidebar {
  width: 250px;
  border-right: 1px solid #d5d7dd;
}
.sidebar-menu {
  height: 100vh;
  padding: 10px 6px;
  background: #f5f7fa;
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
    margin: 10px 0;
  }
}
.sidebar-menu.el-menu--collapse {
  min-width: initial;
}
</style>
