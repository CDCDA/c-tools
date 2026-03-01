<template>
  <div class="md-editor-container">
    <MdEditor
      ref="mdEditorRef"
      v-model="blogData.content"
      @onSave="blogSave"
      @onUploadImg="onUploadImg"
    />
    <div class="setting">
      <div class="setting-btn" @click="toggleSettingPanel">
        <span class="setting-icon">⚙️</span>
      </div>
      <div class="setting-panel" :class="{ show: isSettingPanelVisible }">
        <button class="setting-panel-btn draft-btn">保存为草稿</button>
        <button class="setting-panel-btn submit-btn">提交博客</button>
        <button class="setting-panel-btn draft-list-btn">草稿</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
// const mdEditorRef = ref<any>();
const blogData = ref({
  content: "",
});
const emit = defineEmits(["save", "draft-list"]);
const isSettingPanelVisible = ref(false);
const blogSave = () => {
  emit("save", blogData.value);
};
const onUploadImg = (file: any) => {
  console.log(file);
};

const toggleSettingPanel = () => {
  isSettingPanelVisible.value = !isSettingPanelVisible.value;
};
</script>
<style lang="scss" scoped>
.md-editor-container {
  height: 100%;
  position: relative;
}

.setting {
  // position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 1000;
}

.setting-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }
}

.setting-icon {
  font-size: 24px;
}

.setting-panel {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  margin-right: 10px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;

  &.show {
    transform: translateX(0);
    opacity: 1;
  }
}

.setting-panel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  margin: 0 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.draft-btn {
  background-color: #f5f5f5;
  color: #333;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
}

.draft-list-btn {
  background-color: #2196f3;
  color: white;
}
</style>
