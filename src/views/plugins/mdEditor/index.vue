<template>
  <div class="page-main md-editor">
    <MdEditor class="markdown-editor" ref="mdEditorRef" v-model="mdForm.content" @onSave="handleSave"
      @onUploadImg="onUploadImg" />

    <FloatButtons>
      <template #btns>
        <el-button class="float-btns-panel-btn" type="primary">保存为草稿</el-button>
        <el-button class="float-btns-panel-btn" type="success">提交博客</el-button>
        <el-button class="float-btns-panel-btn" type="info">草稿</el-button>
      </template>
    </FloatButtons>
    <!-- <div class="setting">
      <div class="setting-btn" @click="toggleSettingPanel">
        <el-icon class="setting-icon">
          <Setting />
        </el-icon>
      </div>

    </div>
    <div class="setting-panel" :class="{ 'show': isSettingPanelVisible }">
      <button class="setting-panel-btn draft-btn">保存为草稿</button>
      <button class="setting-panel-btn submit-btn">提交博客</button>
      <button class="setting-panel-btn draft-list-btn">草稿</button>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import { Setting } from "@element-plus/icons-vue";
import FloatButtons from '@/components/floatButtons/index.vue';

import 'md-editor-v3/lib/style.css';

const mdForm = ref({
  title: '',
  content: ''
})

const draftList = ref<any[]>([]);

const isSettingPanelVisible = ref(false);

const toggleSettingPanel = () => {
  isSettingPanelVisible.value = !isSettingPanelVisible.value;
};
const handleSave = () => {

}

const onUploadImg = (file: File) => {
  console.log(file);
}
</script>
<style lang="scss" scoped>
.md-editor {
  height: 100%;
  position: relative;

  .markdown-editor {
    height: 100%;
    border-radius: 4px;
  }
}

.setting {
  position: fixed;
  bottom: 10%;
  right: 27px;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.setting-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  // background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  // &:hover {
  //   background-color: #e0e0e0;
  //   transform: scale(1.05);
  // }
}

.setting-icon {
  font-size: 24px;
}

.setting-panel {
  position: fixed;
  bottom: 10%;
  right: 75px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  /* padding: 8px; */
  /* margin-right: 10px; */
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 40px;

  &.show {
    transform: translateX(0);
    opacity: 1;
  }
}

.setting-panel-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 20px;
  margin: 0 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover,
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.draft-btn {
  background-color: #f5f5f5;
  color: #333;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

.draft-list-btn {
  background-color: #2196F3;
  color: white;
}
</style>
