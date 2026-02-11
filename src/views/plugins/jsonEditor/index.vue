<template>
  <div class="page-main json">
    <Editor class="json-editor" ref="jsonEditorRef" v-model="jsonStr" language="json">
      <template #footer-left-append>
        <el-checkbox v-model="options.autoPaste" style="margin-right: 10px;">自动粘贴</el-checkbox>
        <el-checkbox v-model="options.autoFormat" style="margin-right: 10px;">自动格式化</el-checkbox>
      </template>
      <template #footer-right>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleFormat">格式化</el-button>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleUniqueArray">数组去重</el-button>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleEscape">转义</el-button>
        <el-button type="text" class="code-editor-footer-item" size="mini" @click="handleUnescape">去转义</el-button>
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
