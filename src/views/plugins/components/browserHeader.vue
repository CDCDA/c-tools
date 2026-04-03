<template>
  <div class="browser-header-left">
    <svg-icon iconName="otherSvg-网络设置" data-tauri-drag-region></svg-icon>
    <el-input :model-value="url" @update:model-value="$emit('update:url', $event)" placeholder="请输入网址，回车跳转"
      class="browser-url-input" @keyup.enter="handleNavigate" @focus="handleFocus" />
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  url?: string;
}>();

const emit = defineEmits(["navigate", "update:url"]);

const handleFocus = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement;
  target.select();
};

const handleNavigate = () => {
  emit("navigate", props.url);
};
</script>

<style lang="scss" scoped>
.browser-header-left {
  display: flex;
  align-items: center;
  gap: 8px;

  .browser-url-input {
    width: 320px;

    :deep(.el-input__wrapper) {
      padding-left: 0;
      border-radius: 0 !important;
      box-shadow: none;
      background-color: transparent !important;
      font-size: 12px;

      .el-input__inner {
        font-size: 17px;
        margin-top: 2px;
      }
    }
  }
}
</style>
