<template>
  <div class="page-main code-formater">
    <Editor class="code-editor" ref="codeEditorRef" v-model="codeContent" :language="currentLanguage"
      @update:language="changeLanguage">
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
    </Editor>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Editor from "@/components/editor/index.vue";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";

const options = ref({
  autoPaste: true,
  autoFormat: true,
});
const codeContent = ref("");
const currentLanguage = ref("json");
// 切换语言
const changeLanguage = (lang: string) => {
  currentLanguage.value = lang;
  saveLocalData();
};

const codeEditorRef = ref<Editor>();



// 保存代码格式化插件的设置
const saveLocalData = () => {
  savePluginData("codeFormater", {
    currentLanguage: currentLanguage.value,
    options: options.value,
  });
};

// 加载代码格式化插件的设置
async function loadLocalData() {
  const data = await getPluginData("codeFormater");
  if (data?.currentLanguage) {
    currentLanguage.value = data.currentLanguage;
  }
  if (data?.options) {
    options.value = data.options;
  }
  if (options.value.autoPaste) {
    readText().then((text) => {
      codeContent.value = text;
      if (options.value.autoFormat) {
        setTimeout(() => {
          codeEditorRef.value?.formatContent();
        }, 0);
      }
    });
  }
}

onMounted(() => {
  loadLocalData();

});

onUnmounted(() => {
  saveLocalData();
});

</script>

<style lang="scss" scoped>
.code-editor {
  border-radius: 4px;
  height: calc(100%);

  :deep(.el-checkbox__label) {
    margin-bottom: 3px;
  }
}
</style>
