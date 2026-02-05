<!--
 * @Description: 富文本编辑器组件
-->
<template>
  <div class="c-editor-wrap" :class="showToolBar ? 'with-toolbar' : ''">
    <Toolbar class="c-editor-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor
      class="c-editor"
      :class="showToolBar ? 'with-toolbar' : ''"
      v-model="text"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>
<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { IEditorConfig } from "@wangeditor/editor";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps(["modelValue", "showToolBar"]);
const text = ref(null);
// 初始化 MENU_CONF 属性
const editorConfig: Partial<IEditorConfig> = {
  // JS 语法
  // MENU_CONF: {
  //   emotion: {
  //     emotions: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 '.split(' ') // 数组
  //   }
  // }
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      // 如果希望全部插入 base64 而不进行上传，设置一个极大的值
      // 这里的单位是 Bytes，比如设置 5M = 5 * 1024 * 1024
      base64LimitSize: 100 * 1024 * 1024, // 10MB 以内的图片都转为 base64
    },
  },
};
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef() as any;
// 内容 HTML
const valueHtml = ref("<p>hello</p>");
const mode = "default";
const toolbarConfig = {
  toolbarKeys: [
    // 'headerSelect',
    // 'blockquote',
    // '|',
    "bold",
    "underline",
    "italic",
    "through",
    "code",
    "clearStyle",
    // {
    //   key: 'group-more-style',
    //   title: $t('更多'),
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
    //   menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle']
    // },
    "color",
    // 'bgColor',
    "|",
    // 'fontSize',
    // 'fontFamily',
    // 'lineHeight',
    // '|',
    // 'bulletedList',
    // 'numberedList',
    // 'todo',
    // {
    //   key: 'group-justify',
    //   title: $t('对齐'),
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
    //   menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify']
    // },
    // {
    //   key: 'group-indent',
    //   title: $t('缩进'),
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
    //   menuKeys: ['indent', 'delIndent']
    // },
    // '|',
    "emotion",
    "insertLink",
    {
      key: "group-image",
      title: "图片",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      menuKeys: ["insertImage", "uploadImage"],
    },
    // {
    //   key: 'group-video',
    //   title: $t('视频'),
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
    //   menuKeys: ['insertVideo', 'uploadVideo']
    // },
    // 'insertTable',
    "codeBlock",
    // 'divider',
    "|",
    "undo",
    "redo",
    "|",
    // 'fullScreen'
  ],
};

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

watch(
  () => props.modelValue,
  (val: any) => {
    text.value = val;
  },
  { deep: true },
);

watch(
  () => text.value,
  (val: any) => {
    emit("update:modelValue", val);
  },
  { deep: true },
);

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

function insertNode(img: any) {
  editorRef.value.focus();
  editorRef.value.insertNode(img);
}

function insertText(text: String) {
  editorRef.value.focus();
  editorRef.value.insertText(text);
}

defineExpose({
  insertNode,
  insertText,
  getText() {
    return editorRef.value?.getText();
  },
});
</script>
<style lang="scss" scoped>
.c-editor-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.c-editor {
  min-height: 160px;
  overflow: hidden;
  border-top: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
  border-radius: 0 0 4px 4px;
  :deep(.w-e-modal) {
    padding: 25px 15px 0;
  }
  :deep(.w-e-text-container p) {
    margin: 3px 0;
  }
  :deep(.w-e-scroll) {
    background-image: url(/src/assets/png/comment-back.png);
    background-repeat: no-repeat;
    object-fit: cover;
    background-size: 28% auto;
    background-position: 100% 80%;
  }
  :deep(.babel-container) {
    display: flex;
    align-items: center;
    margin: 10px 0;
    span {
      margin: 0;
      width: 80px;
    }
    &:nth-child(3) {
      display: none;
    }
  }
  :deep(.button-container) {
    display: flex;
    align-items: center;
    justify-content: center;
    button {
      height: 25px;
      display: flex;
      align-items: center;
    }
  }
}
.with-toolbar {
  .c-editor {
    border-radius: 0 0 6px 6px;
  }
}
.c-editor-toolbar {
  border: none !important;
  :deep(.w-e-drop-panel) {
    height: 200px;
    overflow: auto;
  }
  :deep(.w-e-toolbar) {
    border-radius: 6px 6px 0 0;
    border: 1px solid #dcdfe6;
    border-bottom: none;
  }
}
</style>
