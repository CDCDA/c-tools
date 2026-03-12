<template>
  <div class="page-main md-editor-main">
    <MdEditor class="markdown-editor" ref="mdEditorRef" v-model="mdForm.content" @onSave="handleSave"
      @onUploadImg="onUploadImg" />

    <FloatButtons>
      <template #btns>
        <el-button class="float-btns-panel-btn" type="primary" @click="handleDraftList">草稿列表</el-button>
        <el-button class="float-btns-panel-btn" type="primary" @click="handleSaveDraft">保存草稿</el-button>
        <el-button class="float-btns-panel-btn" type="primary" @click="handleBlogList">博客列表</el-button>
        <el-button class="float-btns-panel-btn" type="success" @click="handleSubmit">提交博客</el-button>
      </template>
    </FloatButtons>

    <!-- 博客发布弹窗 -->
    <BlogRelease ref="blogReleaseRef" :blogData="blogData" @resetBlogData="resetBlogData" />

    <!-- 博客列表抽屉 -->
    <BlogListDrawer ref="blogListDrawerRef" @edit-blog="handleEditBlog" />

    <!-- 草稿列表抽屉 -->
    <DraftListDrawer ref="draftListDrawerRef" :draftList="draftList" @edit-draft="handleEditDraft"
      @update-draft-list="updateDraftList" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/store/modules/user.ts";
import { MdEditor } from "md-editor-v3";
import FloatButtons from "@/components/floatButtons/index.vue";
import BlogRelease from "./components/blogRelease.vue";
import BlogListDrawer from "./components/blogListDrawer.vue";
import DraftListDrawer from "./components/draftListDrawer.vue";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";
import { ElNotification } from "element-plus";
import { getBlogById } from "@/api/blog.ts";

import "md-editor-v3/lib/style.css";

const mdForm = ref({
  title: "",
  content: "",
});



const blogData = ref({
  tags: [],
  userId: useUserStore().userId,
  content: "",
  typeId: "",
  coverUrl: "",
  blogAbstract: "",
  isRecommend: "0",
  isOriginal: "1",
}) as any;

// 草稿数据
const draftList = ref<any[]>([]);

const blogReleaseRef = ref(null) as any;
const blogListDrawerRef = ref(null) as any;
const draftListDrawerRef = ref(null) as any;

const handleSave = () => {
  // 保存为草稿的逻辑
  handleSaveDraft();
};

// 保存草稿
const handleSaveDraft = () => {
  if (!mdForm.value.content.trim()) {
    ElNotification.warning('请输入内容后再保存草稿');
    return;
  }

  const draft = {
    id: Date.now(),
    title: mdForm.value.title || '未命名草稿',
    content: mdForm.value.content,
    createTime: new Date().toISOString(),
  };

  // 检查是否已存在相同内容的草稿
  const existingIndex = draftList.value.findIndex(item =>
    item.content === draft.content && item.title === draft.title
  );

  if (existingIndex > -1) {
    // 更新现有草稿
    draftList.value[existingIndex] = draft;
  } else {
    // 添加新草稿
    draftList.value.push(draft);
  }

  saveLocalData();
  ElNotification.success('草稿保存成功');
};

// 打开草稿列表
const handleDraftList = () => {
  draftListDrawerRef.value.open();
};

// 编辑草稿
const handleEditDraft = (draft: any) => {
  mdForm.value.title = draft.title;
  mdForm.value.content = draft.content;
};

// 更新草稿列表
const updateDraftList = (newDraftList: any[]) => {
  draftList.value = newDraftList;
  saveLocalData();
};

const handleSubmit = () => {
  // 提交博客的逻辑
  blogData.value.title = mdForm.value.title;
  blogData.value.content = mdForm.value.content;
  blogReleaseRef.value.open();
};

const handleBlogList = () => {
  // 打开博客列表抽屉
  blogListDrawerRef.value.open();
};

const getBlogInfo = async (id: number) => {
  const { code, data } = await getBlogById(id);
  if (code === 200) {
    return data;
  }
};

const handleEditBlog = async (blog: any) => {
  const blogInfo = await getBlogInfo(blog.blogId);
  // 编辑博客的逻辑
  mdForm.value.title = blogInfo.blogTitle;
  mdForm.value.content = blogInfo.content;
  blogData.value = blogInfo;
  blogListDrawerRef.value.close();
};

const resetBlogData = () => {
  // 重置博客数据的逻辑
  mdForm.value.title = "";
  mdForm.value.content = "";
  blogData.value = {
    title: "",
    content: "",
    tags: [],
    typeId: "",
    coverUrl: "",
    blogAbstract: "",
  };
};

// 保存数据到本地（按照memo的例子）
function saveLocalData() {
  if (!mdForm.value) {
    return;
  }
  savePluginData("mdEditor", {
    mdForm: mdForm.value,
    blogData: blogData.value,
    draftList: draftList.value,
  });
}

// 加载本地数据（按照memo的例子）
async function loadLocalData() {
  const {
    mdForm: localMdForm = { title: "", content: "" },
    blogData: localBlogData = {},
    draftList: localDraftList = [],
  } = await getPluginData("mdEditor");
  Object.assign(mdForm.value, localMdForm);
  Object.assign(blogData.value, localBlogData);
  Object.assign(draftList.value, localDraftList);
}

const onUploadImg = (file: File) => {
  console.log(file);
};

// 生命周期钩子
onMounted(() => {
  loadLocalData();
});

onUnmounted(() => {
  saveLocalData();
});

// 暴露方法给父组件
defineExpose({
  handleSaveDraft,
  handleDraftList,
});
</script>
<style lang="scss" scoped>
.md-editor-main {
  height: calc(100% - 20px);
  position: relative;
  background: transparent;
  padding: 10px;

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
  border-radius: 8px;
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
  background-color: #4caf50;
  color: white;
}

.draft-list-btn {
  background-color: #2196f3;
  color: white;
}
</style>
