<template>
  <div class="generator">
    <div class="header">
      <div class="title">{{ `生成方案[${generator.title || "未命名"}]` }}</div>
      <div class="tools">
        <el-tooltip :content="'格式化:shift+alt+f\n'" placement="top">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
        <el-tooltip content="保存为新方案" placement="top">
          <el-icon><DocumentAdd @click="handleSave" /></el-icon>
        </el-tooltip>
        <el-tooltip content="修改方案" placement="top">
          <el-icon v-if="generator.id"><DocumentChecked @click="handleUpdate" /></el-icon>
        </el-tooltip>
        <el-tooltip content="格式化" placement="top">
          <svg-icon iconName="otherSvg-格式刷" style="cursor: pointer" @click="formate" />
        </el-tooltip>
        <el-tooltip content="生成方案" placement="top">
          <el-icon><Memo @click="handleShowList" /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="generator-input">
      <Editor class="editor" ref="editorRef" v-model="generator.content" language="javascript" />
    </div>
    <GeneratePlanDrawer
      ref="generatePlanDrawerRef"
      @getGenerator="handleGetGenerator"
      @update:generatorList="updateGeneratorList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DocumentAdd, DocumentChecked, QuestionFilled, Memo } from "@element-plus/icons-vue";
import Editor from "@/components/editor/index.vue";
import { ElNotification, ElMessageBox } from "element-plus";
import GeneratePlanDrawer from "./generatePlanDrawer.vue";
import { saveData, getData } from "@/utils/dataSave.ts";

const generatorList = ref([]) as any;
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

const generator = ref(props.modelValue);
const emit = defineEmits(["update:generator"]);
const editorRef = ref(null) as any;

const formate = () => {
  editorRef.value?.format();
};

function handleGetGenerator(row: any) {
  generator.value = row;
}

const generatePlanDrawerRef = ref(null) as any;

function handleShowList() {
  generatePlanDrawerRef.value?.init({
    generatorList: generatorList.value,
  });
}

const saveGenerator = () => {
  saveData("batchGenerator", "generatorList", generatorList.value);
  saveData("batchGenerator", "generator", generator.value);
};

function updateGeneratorList(val: any) {
  generatorList.value = val;
  saveGenerator();
}

// 保存为新方案
function handleSave() {
  ElMessageBox.prompt("请输入生成方案名称", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputErrorMessage: "请输入生成方案名称",
  }).then(({ value }: any) => {
    if (generatorList.value.find((item: any) => item.title === value)) {
      ElNotification.error("生成方案名称已存在");
      return;
    }
    generatorList.value.push({
      id: new Date().getTime(),
      title: value,
      content: generator.value.content,
    });
    saveGenerator();
    ElNotification.success("保存成功");
  });
}

//修改方案
function handleUpdate() {
  ElMessageBox.prompt("请输入生成方案名称", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputValue: generator.value.title,
    inputErrorMessage: "请输入生成方案名称",
  }).then(({ value }: any) => {
    if (generatorList.value.find((item: any) => item.title === value && item.id !== generator.value.id)) {
      ElNotification.error("生成方案名称已存在");
      return;
    }
    generator.value.title = value;
    const index = generatorList.value.findIndex((item: any) => item.id === generator.value.id);
    if (index === -1) {
      ElNotification.error("方案不存在,请先添加方案");
      return;
    }
    generatorList.value[index] = generator.value;
    saveGenerator();
    ElNotification.success("修改成功");
  });
}

async function init() {
  generatorList.value = (await getData("batchGenerator", "generatorList")) || [];
  generator.value = (await getData("batchGenerator", "generator")) || {
    id: null,
    title: "未命名",
    content: "//fileData:文件字符数据\n(fileData) => {\n\n\n\n\n\n\n    return fileData\n}",
  };
}

onMounted(() => {
  init();
});

defineExpose({
  generator,
});
</script>

<style lang="scss" scoped>
.generator {
  width: calc(100%);
  height: calc(100% - 20px);

  .el-icon,
  .svg-icon {
    margin-left: 5px;
    outline: unset;
  }
  .editor {
    border-radius: 0 0 4px 4px;
    padding: 8px 0px;
  }
  .header {
    font-size: 14px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100%);
    padding: 0px;
    height: 30px;
    border-radius: 4px 4px 0 0;
    border: 1px solid #ccc;
    border-bottom: none;
    overflow: hidden;
    .title {
      height: calc(100% + 2px);
      min-width: 28%;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      padding: 0 15px 0 10px;
      color: black;
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -3px;
        width: 100%;
        height: 100%;
        // background: #00968c;
        font-size: 14px;
        color: black;
        z-index: -1;
        border-right: 1px solid #ccc;
        transform: perspective(100px) rotateX(15deg) skew(18deg);
      }
    }
    .tools {
      display: flex;
      justify-content: end;
      font-size: 18px;
      height: calc(100% + 2px);
      width: fit-content;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      min-width: 28%;
      padding: 0 10px;
      color: #fff;
      &::before {
        content: "";
        position: absolute;
        top: 0;
        right: -3px;
        width: 100%;
        height: 100%;
        background: #00968c;
        font-size: 14px;
        color: #fff;
        z-index: -1;
        transform: perspective(100px) rotateX(-15deg) skew(18deg);
      }
      .el-icon {
        margin-left: 8px;
        cursor: pointer;
      }
      .el-icon:active {
        transform: translateY(1px);
      }
    }
  }
}
.generator-input {
  height: calc(100% - 30px);
  :deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
