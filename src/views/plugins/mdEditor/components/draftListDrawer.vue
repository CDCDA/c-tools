<template>
  <el-drawer v-model="dialogVisible" title="草稿列表" size="50%" direction="rtl" @close="handleClose">
    <div class="draft-list-container">
      <List :list="draftList" @update:selectIds="updateSelectIds" ref="listRef" @dbClick="handleDbClick" idKey="id"
        @batchDelete="handleBatchDelete">
        <template #default="{ item }">
          <div class="c-list-item-content">
            {{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}
          </div>
          <div class="c-title flex-between">
            <div class="title">{{ item.title }}</div>
            <div class="draft-info">
              <span class="create-time">{{ formatTime(item.createTime) }}</span>
              <div class="tools">
                <el-tooltip class="item" effect="dark" content="编辑">
                  <el-icon @click="editDraft(item)">
                    <Edit />
                  </el-icon>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除">
                  <el-icon @click="deleteDraft(item.id)">
                    <Delete />
                  </el-icon>
                </el-tooltip>
              </div>
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
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessageBox, ElNotification } from "element-plus";

const props = defineProps({
  draftList: {
    type: Array,
    default: () => []
  }
});

const dialogVisible = ref(false);
const selectIds = ref<number[]>([]);
const emit = defineEmits(["edit-draft", "update-draft-list"]);

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleString();
};

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false;
};

// 更新选中ID
const updateSelectIds = (ids: number[]) => {
  selectIds.value = ids;
};

// 处理双击
const handleDbClick = (item: any) => {
  editDraft(item);
};

// 编辑草稿
const editDraft = (draft: any) => {
  emit('edit-draft', draft);
  dialogVisible.value = false;
};

// 删除草稿
const deleteDraft = (id: number) => {
  ElMessageBox.confirm('确定要删除这个草稿吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const newDraftList = props.draftList.filter((item: any) => item.id !== id);
    emit('update-draft-list', newDraftList);
    ElNotification.success('删除成功');
  }).catch(() => {
    // 取消删除
  });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectIds.value.length === 0) {
    ElNotification.warning('请选择要删除的草稿');
    return;
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectIds.value.length} 个草稿吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const newDraftList = props.draftList.filter((item: any) => !selectIds.value.includes(item.id));
    emit('update-draft-list', newDraftList);
    ElNotification.success('删除成功');
    selectIds.value = [];
  }).catch(() => {
    // 取消删除
  });
};

// 打开抽屉
const open = () => {
  dialogVisible.value = true;
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
.draft-list-container {
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
    min-height: 65px;

    .c-list-item-content {
      height: calc(100% - 43px);
      overflow: auto;
      padding: 5px;
      color: rgb(36, 41, 46);
      font-size: 14px;
      line-height: 1.5;
    }

    .c-title {
      width: calc(100% - 8px);
      border-top: 1px dashed #ebebeb;
      margin-top: 5px;
      font-size: 15px;
      color: #756e6e;
      padding: 4px 4px 0px 4px;

      .draft-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .create-time {
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        .tools {
          width: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 16px;
            margin-left: 10px;
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }
    }
  }
}
</style>