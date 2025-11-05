<template>
  <div class="regex">
    <div class="header">
      <div class="title">{{ `正则方案[${regex.title || "未命名"}]` }}</div>
      <div class="tools">
        <el-tooltip :content="'格式化:shift+alt+f\n'" placement="top">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
        <el-tooltip content="保存为新方案" placement="top">
          <el-icon><DocumentAdd @click="handleSave" /></el-icon>
        </el-tooltip>
        <el-tooltip content="修改方案" placement="top">
          <el-icon v-if="regex.id"><DocumentChecked @click="handleUpdate" /></el-icon>
        </el-tooltip>
        <el-tooltip content="格式化" placement="top">
          <svg-icon iconName="otherSvg-格式刷" style="cursor: pointer" @click="formate" />
        </el-tooltip>
        <el-tooltip content="正则方案" placement="top">
          <el-icon><Memo @click="handleShowList" /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="regex-input">
      <Editor ref="editorRef" v-model="regex.content" language="javascript" />
    </div>
    <RegexDrawer ref="regexDrawerRef" @getRegex="handleGetRegex" @update:regexList="updateRegexList" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DocumentAdd, DocumentChecked, QuestionFilled, Memo } from "@element-plus/icons-vue";
import Editor from "@/components/editor/index.vue";
import { ElNotification } from "element-plus";
import RegexDrawer from "./regexDrawer.vue";
import { saveData, getData } from "@/utils/dataSave.ts";
const regexList = ref([]) as any;
const props = defineProps({
  modelValue: {
    type: Object,
    default: {
      id: null,
      title: "未命名",
      content: "//fileData:文件字符数据\n(fileData) => {\n\n\n\n\n\n\n    return fileData\n}",
    },
  },
});
const regex = ref(props.modelValue);
const emit = defineEmits(["update:regex"]);
const editorRef = ref(null) as any;

const formate = () => {
  editorRef.value?.format();
};

function handleGetRegex(row: any) {
  regex.value = row;
}

function updateRegex() {
  emit("update:regex", regex.value);
}
const regexDrawerRef = ref(null) as any;

function handleShowList() {
  regexDrawerRef.value?.init({
    regexList: regexList.value,
  });
}

const saveRegex = () => {
  saveData("batchRegex", "regexList", regexList.value);
  saveData("batchRegex", "regex", regex.value);
};

function updateRegexList(val: any) {
  regexList.value = val;
  saveRegex();
}
// 生成随机数
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// 保存为新方案
function handleSave() {
  ElMessageBox.prompt("请输入正则方案名称", "Tip", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputErrorMessage: "请输入正则方案名称",
  }).then(({ value }) => {
    if (regexList.value.find((item: any) => item.title === value)) {
      ElNotification.error("正则方案名称已存在");
      return;
    }
    regexList.value.push({
      id: new Date().getTime(),
      title: value,
      content: regex.value.content,
    });
    console.log("regexList", regexList.value);
    saveRegex();
    ElNotification.success("保存成功");
  });
}

//修改方案
function handleUpdate() {
  ElMessageBox.prompt("请输入正则方案名称", "Tip", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputValue: regex.value.title,
    inputErrorMessage: "请输入正则方案名称",
  }).then(({ value }) => {
    if (regexList.value.find((item: any) => item.title === value && item.id !== regex.value.id)) {
      ElNotification.error("正则方案名称已存在");
      return;
    }
    regex.value.title = value;
    const index = regexList.value.findIndex((item: any) => item.id === regex.value.id);
    if (index === -1) {
      ElNotification.error("方案不存在,请先添加方案");
      return;
    }
    regexList.value[index] = regex.value;
    saveRegex();
    ElNotification.success("修改成功");
  });
}

async function init() {
  regexList.value = (await getData("batchRegex", "regexList")) || [];
  regex.value = (await getData("batchRegex", "regex")) || {
    id: null,
    title: "未命名",
    content: "//fileData:文件字符数据\n(fileData) => {\n\n\n\n\n\n\n    return fileData\n}",
  };
  // console.log("regexList", regexList.value);
}

onMounted(() => {
  init();
});

defineExpose({
  regex,
});
</script>

<style lang="scss" scoped>
.regex {
  width: calc(100% - 314px);
  height: 100%;

  .el-icon,
  .svg-icon {
    margin-left: 5px;
    outline: unset;
  }
  .header {
    font-size: 14px;
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .title {
      // width: 100px;
    }
    .tools {
      flex: 1;
      display: flex;
      justify-content: end;
      font-size: 18px;
      .el-icon {
        margin-left: 5px;
        cursor: pointer;
      }
      .el-icon:active {
        transform: translateY(1px);
      }
    }
  }
}
.regex-input {
  height: calc(100% - 30px);
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
