<template>
  <div class="page-main md-editor">
    <MdEditor class="markdown-editor" ref="mdEditorRef" v-model="mdForm.content" @onSave="handleSave"
      @onUploadImg="onUploadImg" />

    <FloatButtons>
      <template #btns>
        <el-button class="float-btns-panel-btn" type="primary" @click="handleBlogList">博客列表</el-button>
        <el-button class="float-btns-panel-btn" type="success" @click="handleSubmit">提交博客</el-button>
      </template>
    </FloatButtons>

    <!-- 博客发布弹窗 -->
    <BlogRelease ref="blogReleaseRef" :blogData="blogData" @resetBlogData="resetBlogData" />

    <!-- 博客列表抽屉 -->
    <BlogListDrawer ref="blogListDrawerRef" @edit-blog="handleEditBlog" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/modules/user.ts';
import { MdEditor } from 'md-editor-v3';
import { Setting } from "@element-plus/icons-vue";
import FloatButtons from '@/components/floatButtons/index.vue';
import BlogRelease from './components/blogRelease.vue';
import BlogListDrawer from './components/blogListDrawer.vue';

import 'md-editor-v3/lib/style.css';

const mdForm = ref({
  title: '',
  content: ''
})

const blogData = ref({
  tags: [],
  userId: useUserStore().userId,
  content: '',
  typeId: '',
  coverUrl: '',
  blogAbstract: '',
  isRecommend: '0',
  isOriginal: '1'
});

const draftList = ref<any[]>([]);
const isSettingPanelVisible = ref(false);
const blogReleaseRef = ref(null) as any;
const blogListDrawerRef = ref(null) as any;

const toggleSettingPanel = () => {
  isSettingPanelVisible.value = !isSettingPanelVisible.value;
};

const handleSave = () => {
  // 保存为草稿的逻辑
  console.log('保存为草稿');
};

const handleSubmit = () => {
  // 提交博客的逻辑
  blogData.value.title = mdForm.value.title;
  blogData.value.content = mdForm.value.content;
  blogReleaseRef.value.open();
};

const handleDraftList = () => {
  // 查看草稿列表的逻辑
  console.log('查看草稿列表');
};

const handleBlogList = () => {
  // 打开博客列表抽屉
  blogListDrawerRef.value.open();
};

const getBlogInfo = (id: number) => {
  // 获取博客详情的逻辑
  console.log('获取博客详情');
};

const handleEditBlog = (blog: any) => {
  // 编辑博客的逻辑
  mdForm.value.title = blog.blogTitle;
  mdForm.value.content = blog.content;
  blogData.value = {
    ...blogData.value,
    title: blog.blogTitle,
    content: blog.content
  };
};

const resetBlogData = () => {
  // 重置博客数据的逻辑
  mdForm.value.title = '';
  mdForm.value.content = '';
  blogData.value = {
    title: '',
    content: '',
    tags: [],
    typeId: '',
    coverUrl: '',
    blogAbstract: ''
  };
};

const onUploadImg = (file: File) => {
  console.log(file);
};
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

.page-main.md-editor {
  border: none;
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
