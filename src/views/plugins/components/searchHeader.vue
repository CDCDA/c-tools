<template>
  <div class="search-header-center">
    <svg-icon iconName="otherSvg-搜索" style="margin-left: 20px; width: 23px; height: 23px;cursor: pointer" 
      @click="handleSearch"></svg-icon>
    <el-input class="plugin-header-search" v-model="searchText" data-tauri-drag-region v-prevent-drag
      @keyup.enter="handleSearch" placeholder="请输入关键字" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const searchText = ref("");

const emit = defineEmits(["search"]);

const handleSearch = () => {
  emit("search", searchText.value);
};
</script>

<style lang="scss" scoped>
.search-header-center {
  display: flex;
  align-items: center;
}
</style>
