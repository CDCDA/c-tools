<!--
 * @Description: 设置页
-->
<template>112
222
  <div class="manage-container">
    <manage-bar></manage-bar>
    <div class="manage-main">
      <side-bar></side-bar>
      <div class="router-main">
        <KeepAlive> <router-view /></KeepAlive>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// import { onMounted } from "vue";
import SideBar from "./components/sideBar.vue";
import ManageBar from "./components/manageBar.vue";

// import { useRouter } from "vue-router";
// const router = useRouter();
// onMounted(() => {});
</script>

<style lang="scss" scoped>
.manage-container {
  width: 100vw;
  height: 100vh;
  background: white;
  position: absolute;
  font-family: "shark";

  .manage-main {
    height: 100%;
    width: inherit;
    background: white;
    width: 100%;
    display: flex;
  }

  .router-main {
    width: 100%;
    height: calc(100% - 2.8rem);
    overflow: auto;
    display: flex;

    .essay-manage-editor {
      width: calc(100% - 60px);
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
      min-height: calc(100% - 60px);
    }

    .blog-manage-editor {
      width: calc(100% - 60px);
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
