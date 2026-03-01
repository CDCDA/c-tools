<template>
  <div class="memo-tools">
    <div class="memo-tools-top">
      <el-tooltip content="批量操作" placement="top">
        <el-button
          type="primary"
          circle
          class="memo-tools-item"
          size="mini"
          @click="emit('changeMode')"
        >
          <svg-icon iconName="otherSvg-批量" class="user-icon"></svg-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="全选" placement="top">
        <el-button
          v-if="props.mode === 'multi'"
          :type="props.isAll ? 'primary' : 'default'"
          circle
          class="memo-tools-item"
          size="mini"
          @click="emit('selectAll')"
        >
          <svg-icon iconName="otherSvg-全选" class="user-icon"></svg-icon>
        </el-button>
      </el-tooltip>
    </div>
    <div class="memo-tools-bottom">
      <el-tooltip content="添加" placement="top">
        <el-button
          type="primary"
          circle
          class="memo-tools-item"
          :icon="Plus"
          size="mini"
          @click="emit('openMemoDrawer', 'add')"
        >
        </el-button>
      </el-tooltip>
      <el-tooltip content="编辑" placement="top">
        <el-button
          type="success"
          circle
          class="memo-tools-item"
          :icon="Edit"
          size="mini"
          @click="emit('openMemoDrawer', 'edit')"
        >
        </el-button>
      </el-tooltip>
      <el-tooltip content="删除" placement="top">
        <el-button
          type="danger"
          circle
          class="memo-tools-item"
          :icon="Delete"
          size="mini"
          @click="emit('deleteMemo')"
        >
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Plus, Delete, Edit } from "@element-plus/icons-vue";
const props = defineProps({
  mode: {
    type: String,
    default: "single",
  },
  isAll: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  "deleteMemo",
  "openMemoDrawer",
  "changeMode",
  "selectAll",
]);
</script>
<style lang="scss" scoped>
.memo-tools {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 10px;
  position: fixed;
  right: 0;
  width: 50px;
  bottom: 0;
  height: calc(100% - 82px);

  .memo-tools-top,
  .memo-tools-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .memo-tools-item {
      width: 40px !important;
      height: 40px !important;
      font-size: 20px !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
  }

  .memo-tools-top {
    .memo-tools-item {
      margin: 0 0 20px 0;
    }
  }

  .memo-tools-bottom {
    .memo-tools-item {
      margin: 20px 0 0 0;
    }
  }
}
</style>
