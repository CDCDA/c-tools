<template>
  <div class="memo-bar-container">
    <el-menu class="memo-bar">
      <el-menu-item v-for="item in typeList" @click="emit('update:activeType', item)" :key="item.value"
        :index="item.value" :class="{ 'is-active': item.value === activeType.value }">
        <div class="menu-content flex-between">
          <span>{{ item.label }}</span>
          <div class="tools flex-center">
            <el-icon @click="emit('editType', item)" v-if="item.value !== 'all'">
              <Edit />
            </el-icon>
            <el-icon @click="emit('deleteType', item)" v-if="item.value !== 'all'">
              <Delete />
            </el-icon>
          </div>
        </div>
      </el-menu-item>
    </el-menu>
    <div class="menu-footer">
      <el-button type="primary" :icon="Plus" size="mini" @click="emit('addType', activeType)"></el-button>
      <el-button type="success" :icon="Edit" size="mini" @click="emit('editType', activeType)"></el-button>
      <el-button type="danger" :icon="Delete" size="mini" @click="emit('deleteType', activeType)"></el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Plus, Delete, Edit } from "@element-plus/icons-vue";
const emit = defineEmits(["changeType", 'deleteType', 'addType', 'editType']);
const props = defineProps({
  typeList: {
    type: Array,
    default: () => [] as any,
  },
  activeType: {
    type: Object,
    default: "",
  },
});
</script>
<style lang="scss" scoped>
.memo-bar-container {
  height: calc(100% - 46px);
  width: 155px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: 0;
  top: 46px;

  .menu-footer {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    width: calc(100% - 21px);

    // border-right: 1px solid #dcdfe6;
    .el-button {
      width: 25px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
  }

  .memo-bar {
    height: 100%;
    width: 155px;
    border-right: none;

    .el-menu-item {
      padding: 15px 6px 15px 12px;
    }

    .menu-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 3px;
      }

      .tools {
        width: fit-content;
        flex-shrink: 0;
      }

      :deep(.el-icon) {
        margin: 0;
      }
    }

    :deep(.el-menu-item) {
      height: 40px;

      &.is-active {
        background-color: #f5f7fa;
      }

      // &:active {
      //   background-color: var(--el-color-primary);
      // }
    }
  }
}
</style>
