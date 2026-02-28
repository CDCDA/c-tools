<template>
  <div class="page-main translation">
    <el-splitter>
      <el-splitter-panel :min="200" size="50%">
        <div class="translate-wait part-container">
          <div class="part-header">
            <div class="part-title">待翻译文本</div>
            <div class="part-tools">
              <el-dropdown class="svg-btn" placement="bottom" trigger="click">
                <el-button type="text" size="mini" style="margin-bottom: -2px">
                  {{sourceLangList.find((lang) => lang.value === options.sourceLang)?.label || options.sourceLang}}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="lang in sourceLangList" :key="lang.value"
                      @click="options.sourceLang = lang.value">
                      {{ lang.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-icon style="margin-right: 6px" @click="switchLang">
                <Switch />
              </el-icon>
              <el-dropdown class="svg-btn" placement="bottom" trigger="click">
                <el-button type="text" size="mini" style="margin-bottom: -2px">
                  {{targetLangList.find((lang) => lang.value === options.targetLang)?.label || options.targetLang}}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="lang in targetLangList" :key="lang.value"
                      @click="options.targetLang = lang.value">
                      {{ lang.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="part-main">
            <el-input type="textarea" v-model="originalText" @input="debouncedTranslate" placeholder="请输入待翻译文本" />
          </div>
          <div class="part-footer">
            <div class="part-footer-left">
              <div class="part-footer-item">
                <el-checkbox v-model="options.autoReadClipboard" style="margin-bottom: 2px">
                  自动读取剪贴板
                </el-checkbox>
              </div>
            </div>
            <div class="part-footer-right">
              <div class="part-footer-item">
                <span class="pre-text">
                  <el-tooltip content="自动读取剪贴板时，如果剪贴板内容小于限制字符数，将自动翻译" placement="bottom">
                    <el-icon style="margin-top: 1px">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                  限制字符数
                </span>

                <el-input class="linit-number-input" v-model="options.limitNumber" placeholder="限制字符数"
                  style="box-shadow: none; width: 60px; border: none" />
              </div>
            </div>
          </div>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="200" size="50%">
        <div class="translate-result part-container">
          <div class="part-header">
            <div class="part-title">翻译结果</div>
            <div class="part-tools">
              <span class="pre-text">自动转为</span>
              <el-dropdown class="label-value-btn" placement="top" trigger="click">
                <el-button type="text" size="mini" style="margin-bottom: -2px">
                  {{
                    formatList.find((format) => format.value === options.autoFormatType)?.label ||
                    options.autoFormatType
                  }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="format in formatList" :disabled="format.value === options.autoFormatType"
                      :key="format.value" @click="options.autoFormatType = format.value">
                      {{ format.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="part-main">
            <el-input type="textarea" v-model="translateText" placeholder="请输入待翻译文本" />
          </div>
          <div class="part-footer">
            <div class="part-footer-right">
              <div class="part-footer-item">
                <el-checkbox v-model="options.autoCopy" style="margin-bottom: 2px"> 自动复制 </el-checkbox>
              </div>
            </div>
            <div class="part-footer-right">
              <div class="part-footer-item">
                <span class="pre-text">切换为</span>
                <el-dropdown class="label-value-btn" placement="bottom" trigger="click">
                  <el-button type="text" size="mini" style="margin-bottom: -2px">
                    {{formatList.find((format) => format.value === options.formatType)?.label || options.formatType}}
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="format in formatList" :disabled="format.value === options.formatType"
                        :key="format.value" @click="handleFormatType(format)">
                        {{ format.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Switch } from "@element-plus/icons-vue";
import { translate, quickTranslate } from "@/api/translation.ts";
import { debounce } from "lodash";
import { QuestionFilled } from "@element-plus/icons-vue";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { savePluginData, getPluginData } from "@/utils/localSave.ts";

// 待翻译文本
const originalText = ref("");
// 翻译结果
const translateText = ref("");

const sourceLangList = [
  {
    label: "自动",
    value: "auto",
  },
  {
    label: "简体中文",
    value: "zh",
  },
  {
    label: "英文",
    value: "en",
  },
  {
    label: "繁体中文",
    value: "zh-TW",
  },
  {
    label: "日文",
    value: "ja",
  },
  {
    label: "俄语",
    value: "ru",
  },
  {
    label: "马来语",
    value: "ms",
  },
];

const targetLangList = [
  {
    label: "简体中文",
    value: "zh",
  },
  {
    label: "繁体中文",
    value: "zh-TW",
  },
  {
    label: "英文",
    value: "en",
  },
  {
    label: "日文",
    value: "ja",
  },
  {
    label: "俄语",
    value: "ru",
  },
  {
    label: "马来语",
    value: "ms",
  },
];

const formatList = ref([
  {
    label: "大驼峰",
    value: "upperCamelCase",
  },
  {
    label: "小驼峰",
    value: "lowerCamelCase",
  },
  {
    label: "下划线",
    value: "underline",
  },
  {
    label: "短横线",
    value: "kebab-case",
  },
  {
    label: "常量",
    value: "constant",
  },
  {
    label: "句子",
    value: "sentence",
  },
  {
    label: "标题",
    value: "title",
  },
]);

const tempText = ref("");

const options = ref({
  autoCopy: true,
  formatType: "lowerCamelCase",
  autoFormatType: "lowerCamelCase",
  sourceLang: "zh",
  targetLang: "en",
  autoReadClipboard: true,
  limitNumber: 100,
});

const switchLang = () => {
  const temp = options.value.sourceLang;
  options.value.sourceLang = options.value.targetLang;
  options.value.targetLang = temp;
  handleTranslate();
}



const debouncedTranslate = debounce(() => {
  // handleAiTranslate();
  handleTranslate();
}, 500);

const handleTranslate = async () => {
  console.log("开始翻译", originalText.value);
  if (!originalText.value) {
    return;
  }
  const res = await translate({
    text: originalText.value,
    source: "zh",
    target: "en",
  });
  tempText.value = JSON.parse(JSON.stringify(res));
  translateText.value = formatText(res, options.value.autoFormatType);
  if (options.value.autoCopy) {
    writeText(translateText.value);
  }
};


const handleAiTranslate = async () => {
  console.log("开始AI翻译", originalText.value);
  if (!originalText.value) {
    return;
  }
  const res = await quickTranslate(originalText.value);
  console.log("AI翻译结果", res);
  tempText.value = { ...res }
  translateText.value = formatText(res, options.value.autoFormatType);
  if (options.value.autoCopy) {
    writeText(translateText.value);
  }
};

function formatText(text: string, type: string): string {
  // 先处理输入文本，移除多余空格，标准化分隔符
  const normalized = text
    .trim()
    .replace(/[_\s]+/g, " ") // 将下划线和多个空格统一为单个空格
    .toLowerCase();

  switch (type) {
    case "upperCamelCase": // PascalCase
      return normalized
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    case "lowerCamelCase": // camelCase
      return normalized
        .split(" ")
        .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
        .join("");

    case "underline": // snake_case
      return normalized.replace(/\s+/g, "_");

    case "kebab-case": // 新增：短横线连接
      return normalized.replace(/\s+/g, "-");

    case "constant": // CONSTANT_CASE
      return normalized.replace(/\s+/g, "_").toUpperCase();

    case "sentence": // Sentence case
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);

    case "title": // Title Case
      return normalized
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    default:
      return tempText.value;
  }
}

onMounted(async () => {
  const optionsData = await getPluginData("translation");
  optionsData ? (options.value = optionsData) : null;

  if (options.value.autoReadClipboard) {
    readText().then((text) => {
      originalText.value = text;
      if (originalText.value.length <= options.value.limitNumber) {
        handleTranslate();
      }
    });
  }
});

onBeforeUnmount(() => {
  savePluginData("translation", options.value);
});
</script>

<style lang="scss" scoped>
.page-main.translation {
  .translate-wait {
    .el-textarea {
      border-radius: 0 0 4px 4px;
      height: 100%;

      :deep(.el-textarea__inner) {
        border-radius: 0 0 4px 4px;
        box-shadow: none;
        height: 100%;
        border: 1px solid #EBEBEB;
      }
    }
  }

  .translate-result {
    .el-textarea {
      border-radius: 0;
      height: 100%;

      :deep(.el-textarea__inner) {
        border-radius: 0;
        box-shadow: none;
        height: 100%;
        border: 1px solid #EBEBEB;
      }
    }
  }
}

.linit-number-input {
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    height: 25px !important;
  }
}
</style>
