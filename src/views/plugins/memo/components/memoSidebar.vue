<template>
  <div class="memo-bar-container">
    <el-menu class="memo-bar">
      <el-menu-item
        v-for="item in props.typeList"
        @click="emit('update:activeType', item)"
        :key="item.value"
        :index="item.value"
        :class="{ 'is-active': item.value === activeType.value }"
      >
        <div class="menu-content flex-between">
          <span>{{ item.label }}</span>
          <div class="tools flex-center">
            <svg-icon
              iconName="otherSvg-编辑"
              style="margin-left: 5px; font-size: 16px"
              @click="emit('editType', item)"
              v-if="item.value !== 'all'"
            />
            <!-- <el-icon @click="emit('editType', item)" v-if="item.value !== 'all'">
              <Edit />
            </el-icon> -->
            <svg-icon
              iconName="otherSvg-删除"
              style="margin-left: 5px; font-size: 16px"
              @click="emit('deleteType', item)"
              v-if="item.value !== 'all'"
            />
            <!-- <el-icon @click="emit('deleteType', item)" v-if="item.value !== 'all'">
              <Delete />
            </el-icon> -->
          </div>
        </div>
      </el-menu-item>
    </el-menu>
    <!-- <div class="menu-footer">

      <svg-icon iconName="otherSvg-新增" class="memo-sidebar-btn svg-btn" @click="emit('addType', activeType)" />
      <svg-icon iconName="otherSvg-编辑" class="memo-sidebar-btn svg-btn" @click="emit('editType', activeType)" />
      <svg-icon iconName="otherSvg-删除" class="memo-sidebar-btn svg-icon" @click="emit('deleteType', activeType)" />

      <el-button type="primary" :icon="Plus" size="mini" @click="emit('addType', activeType)"></el-button>
      <el-button type="success" :icon="Edit" size="mini" @click="emit('editType', activeType)"></el-button>
      <el-button type="danger" :icon="Delete" size="mini" @click="emit('deleteType', activeType)"></el-button>
    </div> -->
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  typeList: {
    type: Array as any,
    default: () => [] as any,
  },
  activeType: {
    type: Object,
    default: "",
  },
});
const emit = defineEmits([
  "update:activeType",
  "deleteType",
  "addType",
  "editType",
]);
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
    padding: 5px 10px 15px 10px;
    width: calc(100% - 21px);

    // border-right: 1px solid #dcdfe6;
    .el-button {
      width: 25px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
  }

  .memo-bar {
    height: 100%;
    width: calc(100% - 20px);
    border-right: none;
    background-color: transparent;

    .el-menu-item {
      padding: 15px 6px 15px 12px;
    }

    .menu-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      position: relative;

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 40px;
        /* 为工具按钮留出空间 */
      }

      .tools {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        opacity: 0;
        width: fit-content;
        transition: opacity 0.3s ease;
      }

      :deep(.el-icon) {
        margin: 0 0 0 0px;
        cursor: pointer;
      }
    }

    :deep(.el-menu-item:hover) {
      .tools {
        opacity: 1;
      }
    }

    :deep(.el-menu-item) {
      height: 40px;
      border-radius: 6px;

      margin: 4px 0;

      &.is-active,
      &:hover {
        background-color: rgba(0, 150, 140, 0.1);
      }

      // &:active {
      //   background-color: var(--el-color-primary);
      // }
    }
  }

  .memo-sidebar-btn {
    font-size: 25px;
    color: #666666;
    cursor: pointer;
  }
}
</style>
