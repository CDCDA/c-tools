<template>
  <div class="page-main json">
    <Editor class="json-editor" ref="jsonEditorRef" v-model="jsonStr" language="json">
      <template #footer-left-append>
        <el-tooltip content="自动粘贴" placement="top">
          <svg-icon iconName="otherSvg-粘贴" :class="options.autoPaste ? 'is-active' : ''"
            @click="options.autoPaste = !options.autoPaste" class="svg-btn" />
        </el-tooltip>
        <el-tooltip content=" 自动格式化" placement="top">
          <svg-icon iconName="otherSvg-自动格式化" :class="options.autoFormat ? 'is-active' : ''"
            @click="options.autoFormat = !options.autoFormat" class="svg-btn" />
        </el-tooltip>
      </template>
      <template #footer-right>
        <el-tooltip content="格式化" placement="top">
          <svg-icon iconName="otherSvg-格式刷" class="svg-btn" @click="handleFormat" />
        </el-tooltip>
        <el-tooltip content="数组去重" placement="top">
          <svg-icon iconName="otherSvg-去重" class="svg-btn" @click="handleUniqueArray" />
        </el-tooltip>
        <el-tooltip content="转义" placement="top">
          <svg-icon iconName="otherSvg-转义" class="svg-btn" @click="handleEscape" />
        </el-tooltip>
        <el-tooltip content="去转义" placement="top">
          <svg-icon iconName="otherSvg-转义" class="svg-btn" style="transform: rotate(90deg);"
            @click="handleUnescape" />
        </el-tooltip>
        <!-- <el-button type="text" class="svg-btn" size="mini" @click="handleFormat">格式化</el-button> -->
        <!-- <el-button type="text" class="svg-btn" size="mini" @click="handleUniqueArray">数组去重</el-button> -->
        <!-- <el-button type="text" class="svg-btn" size="mini" @click="handleEscape">转义</el-button>
        <el-button type="text" class="svg-btn" size="mini" @click="handleUnescape">去转义</el-button> -->
      </template>
    </Editor>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import Editor from "@/components/editor/index.vue";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";

const options = ref({
  autoPaste: true,
  autoFormat: true,
});
const jsonStr = ref("");
const jsonEditorRef = ref(null) as any;

const handleFormat = () => {
  jsonEditorRef.value?.formatContent();
};

const handleUniqueArray = () => {
  jsonEditorRef.value?.uniqueArray();
};

const handleEscape = () => {
  jsonEditorRef.value?.escapeSpecialChars();
};

const handleUnescape = () => {
  jsonEditorRef.value?.unescapeSpecialChars();
};

// 保存JSON编辑器的设置
const saveLocalData = () => {
  savePluginData("jsonEditor", {
    options: options.value,
  });
};

// 加载JSON编辑器的设置
async function loadLocalData() {
  const data = await getPluginData("jsonEditor");
  if (data?.options) {
    options.value = data.options;
  }
  if (options.value.autoPaste) {
    readText().then((text) => {
      jsonStr.value = text;
      if (options.value.autoFormat) {
        setTimeout(() => {
          jsonEditorRef.value?.formatContent();
        }, 0);
      }
    });
  }
}

// 监听options变化，自动保存
watch(
  options,
  () => {
    saveLocalData();
  },
  { deep: true }
);

onMounted(() => {
  loadLocalData();
});

onUnmounted(() => {
  saveLocalData();
});
</script>

<style lang="scss" scoped>
.json-editor {
  border-radius: 4px;
  height: calc(100% - 12px);
}


.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>
