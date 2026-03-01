<template>
  <el-drawer
    v-model="dialogVisible"
    title="博客列表"
    size="50%"
    direction="rtl"
    :close-on-click-modal="false"
  >
    <div class="blog-list-container">
      <!-- <el-form :model="form" :rules="rules" ref="formRef" label-width="0px">
        <el-form-item prop="blogTitle">
          <el-input
            v-model="queryForm.blogTitle"
            @keyup.enter="handleSearch"
            placeholder="请输入博客标题"
          />
        </el-form-item>
      </el-form> -->
      <List :list="blogList">
        <template #default="{ item }">
          <div class="c-list-item-content" @click="handleClick(item)">
            {{ item.blogAbstract }}
          </div>
          <div class="c-title flex-between">
            <div class="title">{{ item.blogTitle }}</div>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="编辑">
                <el-icon @click="playVideo(item)">
                  <VideoPlay />
                </el-icon>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除">
                <el-icon @click="editItem(item)">
                  <Edit />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </template>
      </List>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import List from "@/components/list/index.vue";
import { pageBlogs } from "@/api/blog.ts";
const dialogVisible = ref(false);
const loading = ref(false);
const blogList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const queryForm = ref({
  blogTitle: "",
  pageNum: currentPage.value,
  pageSize: pageSize.value,
});
const emit = defineEmits(["edit-blog"]);

// 模拟获取博客列表数据
const getBlogList = async () => {
  loading.value = true;
  const { code, rows, total: totalCount } = await pageBlogs(queryForm.value);
  if (code === 200) {
    blogList.value = rows || [];
    total.value = totalCount || 0;
  }
};

// 处理搜索
// const handleSearch = () => {
//   queryForm.value.pageNum = 1;
//   getBlogList();
// };

// 处理编辑
// const handleEdit = (blog: any) => {
//   emit('edit-blog', blog);
//   dialogVisible.value = false;
// };

// 处理删除
// const handleDelete = (id: number) => {
//   ElMessageBox.confirm('确定要删除这篇博客吗？', '警告', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(() => {
//     // 这里应该调用实际的API删除博客
//     ElMessage.success('删除成功');
//     getBlogList();
//   }).catch(() => {
//     // 取消删除
//   });
// };
// 处理点击
const handleClick = (blog: any) => {
  emit("edit-blog", blog);
  dialogVisible.value = false;
};

const playVideo = (item?: any) => {
  console.log(item);
  // emit('play-video', item);
};
// 处理编辑
const editItem = (blog: any) => {
  emit("edit-blog", blog);
  dialogVisible.value = false;
};
// 打开抽屉
const open = () => {
  dialogVisible.value = true;
  getBlogList();
};

// 关闭抽屉
const close = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  // 初始化时可以加载数据
});

defineExpose({
  open,
  close,
});
</script>

<style lang="scss">
.blog-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .c-list .c-list-item {
    border-radius: 6px;

    border: 1px solid #ebebeb;
    cursor: pointer;
    margin-bottom: 10px;
    width: calc(100% - 14px);
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: start;

    .c-list-item-content {
      height: calc(100% - 32px);
      overflow: auto;
      padding: 5px;
      color: rgb(36, 41, 46);
    }

    .c-title {
      width: calc(100% - 8px);
      border-top: 1px dashed #ebebeb;
      margin-top: 10px;
      font-size: 15px;
      color: #756e6e;
      padding: 4px 4px 0px 4px;

      .tools {
        width: fit-content;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 16px;
          margin-left: 10px;
        }
      }
    }

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.blog-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.blog-title {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.blog-list-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
