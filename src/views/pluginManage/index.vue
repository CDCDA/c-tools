<!--
 * @Description: 插件管理页
-->
<template>
  <div class="plugin-manage-container">
    <plugin-manage-bar></plugin-manage-bar>
    <div class="plugin-manage-main">
      <plugin-side-bar></plugin-side-bar>
      <div class="router-main">
        <KeepAlive> <router-view /></KeepAlive>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import PluginSideBar from "./components/pluginSideBar.vue";
import PluginManageBar from "./components/pluginManageBar.vue";
</script>

<style lang="scss" scoped>
.plugin-manage-container {
  width: 100vw;
  height: 100vh;
  background: white;
  position: absolute;
  font-family: "shark";

  .plugin-manage-main {
    height: 100%;
    width: inherit;
    background: white;
    width: 100%;
    display: flex;
  }

  .router-main {
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    display: flex;
    overflow: hidden;
  }
}
</style>