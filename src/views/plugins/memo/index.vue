<template>
  <div class="page-main memo">
    <MemoSidebar ref="memoSidebarRef" :typeList="typeList" :activeType="activeType"
      @update:activeType="updateActiveType" @addType="addType" @editType="editType" @deleteType="deleteType" />
    <MemoList ref="memoListRef" :mode="mode" :memoList="memoList" :activeType="activeType" :currentMemo="currentMemo"
      :selectIds="selectIds" @deleteMemo="deleteMemo" @openMemoDrawer="openMemoDrawer"
      @update:selectIds="updateSelectIds" />
    <!-- <MemoTools ref="memoToolsRef" :mode="mode" :isAll="isAll" :activeType="activeType" :currentMemo="currentMemo"
      @deleteMemo="deleteMemo" @openMemoDrawer="openMemoDrawer" @changeMode="changeMode" @selectAll="selectAll" /> -->
    <MemoDrawer ref="memoDrawerRef" @submit="submitMemo" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import MemoDrawer from "@/views/plugins/memo/components/memoDrawer.vue";

import { Plus, Delete } from "@element-plus/icons-vue";
import MemoSidebar from "./components/memoSidebar.vue";
import MemoTools from "./components/memoTools.vue";
import MemoList from "./components/memoList.vue";

import { writeText, readText } from "@tauri-apps/plugin-memo-manager";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";
import { ElNotification } from "element-plus";
import { currentWindow } from "@/utils/window.ts";

const currentMemo = computed(() => {
  if (mode.value === 'single') {
    return memoList.value.find((item: any) => item.id === selectIds.value[0]) || {};
  }
  return {};
});
const selectIds = ref<any>([]);
const mode = ref('single')
const isAll = computed(() => {
  return selectIds.value.length === memoList.value.length;
})
function selectAll() {
  if (mode.value === 'single') {
    return;
  }
  if (selectIds.value.length === memoList.value.length) {
    selectIds.value = [];
  } else {
    selectIds.value = memoList.value.map((item: any) => item.id);
  }
}

function changeMode() {
  mode.value = mode.value === 'single' ? 'multi' : 'single';
  selectIds.value = [];
}

const typeList = ref([
  {
    label: "全部",
    value: "all",
  },
]);

const activeType = ref({
  label: "全部",
  value: "all",
});

const totalMemoList = ref([]);

function updateCurrentMemo(memo: any) {
  currentMemo.value = memo;
}

function updateSelectIds(ids: any) {
  selectIds.value = ids;
}

function updateActiveType(type: any) {
  activeType.value = type;
}

function submitMemo(memoData: any) {
  if (memoData?.id) {
    totalMemoList.value = totalMemoList.value.map((item: any) => {
      if (item.id === memoData.id) {
        return memoData;
      }
      return item;
    });
  } else {
    totalMemoList.value.push({
      ...memoData,
      id: Date.now(),
    });
  }
  saveLocalData();
}

const memoDrawerRef = ref<MemoDrawer>(null);
function openMemoDrawer(action: string, memo?: any) {
  console.log("openMemoDrawer", action, memo)
  const memoObj = { ...(memo || currentMemo.value) }
  memoDrawerRef.value?.init({ action, memo: memoObj, activeType: activeType.value.value });
}

function saveLocalData() {
  if (!totalMemoList.value) {
    return;
  }
  console.log(totalMemoList.value);
  savePluginData("memo", {
    totalMemoList: totalMemoList.value,
    memoList: totalMemoList.value,
    typeList: typeList.value,
    activeType: activeType.value,
  });
}

async function loadLocalData() {
  const {
    totalMemoList: localTotalMemoList = [],
    memoList: localMemoList = [],
    typeList: localTypeList = [],
    activeType: localActiveType = "all",
  } = await getPluginData("memo");
  Object.assign(totalMemoList.value, localTotalMemoList);
  Object.assign(totalMemoList.value, localMemoList);
  Object.assign(typeList.value, localTypeList);
  activeType.value = localActiveType || {
    label: "全部",
    value: "all",
  };
}
const searchText = ref<any>(null)

const memoList = computed(() => {
  if (activeType.value.value === "all") {
    return searchText.value ? totalMemoList.value.filter((x: any) => x.title.includes(searchText.value) || x.text.includes(searchText.value)) : totalMemoList.value;
  }
  return searchText.value ? totalMemoList.value.filter((memo: any) => memo.type === activeType.value.value && (memo.title.includes(searchText.value) || memo.text.includes(searchText.value))) : totalMemoList.value.filter((memo: any) => memo.type === activeType.value.value);
});

function deleteMemo(memo?: any) {
  console.log("deleteMemo", memo, selectIds.value);
  if (selectIds.value.length > 1) {
    if (!selectIds.value.length) {
      ElNotification.error("请先选择要删除的备忘录");
      return;
    } else {
      ElMessageBox.confirm(`确认删除 ${selectIds.value.length} 个备忘录吗？`, "Tip", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        totalMemoList.value = totalMemoList.value.filter((item: any) => !selectIds.value.includes(item.id));
        ElNotification.success("删除成功");
        selectIds.value = [];
        saveLocalData();
      });
    }
    return
  }
  if (!memo) {
    memo = currentMemo.value;
  }
  if (!memo.id) {
    ElNotification.error("请先选择要删除的备忘录");
    return;
  }
  ElMessageBox.confirm("确认删除该备忘录吗？", "Tip", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    totalMemoList.value = totalMemoList.value.filter((item: any) => item.id !== memo.id);
    ElNotification.success("删除成功");
    selectIds.value = [];
    saveLocalData();
  });
}

const addType = () => {
  ElMessageBox.prompt("请输入分类名称", "Tip", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputErrorMessage: "请输入分类名称",
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue;
        const isExist = typeList.value.find((item: any) => item.label === value);
        if (isExist) {
          ElNotification.error("分类名称已存在");
          return;
        }
        done();
      } else {
        done();
      }
    }
  }).then(({ value }) => {
    // 这里已经通过验证
    typeList.value.push({
      label: value,
      value: new Date().getTime(),
    });
    saveLocalData();
  }).catch(() => {
    // 用户点击取消
  });
};

const editType = (typeObj: any) => {
  const type = { ...typeObj }
  ElMessageBox.prompt("", "请输入分类名称", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputValue: type.label,
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue;
        const filterList = typeList.value.filter((item: any) => item.value !== type.value);
        const isExist = filterList.find((item: any) => item.label === value);
        if (isExist) {
          ElNotification.error("分类名称已存在");
          return;
        }

        done();
      } else {
        done();
      }
    }
  }).then(({ value }) => {
    typeList.value = typeList.value.map((item: any) => {
      if (item.value === type.value) {
        return {
          ...item,
          label: value,
        };
      }
      return item;
    });
    saveLocalData();
  });
};

const deleteType = (type: any) => {
  const isExist = totalMemoList.value.filter((item: any) => item.type === type.value);
  let confirmMsg = "";
  if (isExist.length > 0) {
    confirmMsg = `该分类下共有 ${isExist.length} 条记录，删除后无法恢复。\n确认删除分类[${type.label}]吗？`;
  } else {
    confirmMsg = `确认删除分类[${type.label}]吗？`;
  }
  ElMessageBox.confirm(confirmMsg, "Tip", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    typeList.value = typeList.value.filter((item: any) => item.value !== type.value);
    activeType.value = {
      label: "全部",
      value: "all",
    };
    saveLocalData();
  });
};

function handleSearch(val: any) {
  console.log("触发搜索", val)
  searchText.value = val
}

onMounted(() => {
  loadLocalData();
});
onUnmounted(() => {
  saveLocalData()
});

defineExpose({
  handleSearch
})
</script>

<style lang="scss" scoped>
.page-main.memo {
  padding: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  position: relative;
  overflow: hidden;
}
</style>
