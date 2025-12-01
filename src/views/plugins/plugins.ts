import { defineAsyncComponent } from "vue";
// const FileHasher = defineAsyncComponent(()=> import("@/views/plugins/fileHasher/index.vue";
// const SqlConverter = defineAsyncComponent(()=> import("@/views/plugins/sqlConverter/index.vue";
// const AiFixedTips = defineAsyncComponent(()=> import("@/views/plugins/aiFixedTips/index.vue";
const Clipboard = defineAsyncComponent(() => import("@/views/plugins/clipboard/index.vue"));
const SystemInfo = defineAsyncComponent(() => import("@/views/plugins/systemInfo/index.vue"));
const FileOrganizer = defineAsyncComponent(() => import("@/views/plugins/fileOrganizer/index.vue"));
const FileTreeJson = defineAsyncComponent(() => import("@/views/plugins/fileTreeJson/index.vue"));
const NginxFormater = defineAsyncComponent(() => import("@/views/plugins/nginxFormater/index.vue"));
const BatchRegex = defineAsyncComponent(() => import("@/views/plugins/batchRegex/index.vue"));
const codeGenerator = defineAsyncComponent(() => import("@/views/plugins/codeGenerator/index.vue"));
const ColorExtraction = defineAsyncComponent(() => import("@/views/plugins/colorExtraction/index.vue"));
const Screenshot = defineAsyncComponent(() => import("@/views/plugins/screenshot/index.vue"));
const ScreenshotAndSuspended = defineAsyncComponent(() => import("@/views/plugins/screenshotAndSuspended/index.vue"));
const Image = defineAsyncComponent(() => import("@/views/plugins/image/index.vue"));
const SqlConverter = defineAsyncComponent(() => import("@/views/plugins/sqlConverter/index.vue"));
const Translation = defineAsyncComponent(() => import("@/views/plugins/translation/index.vue"));
export const pluginData = [
  // {
  //   id: 1,
  //   name: "哈希计算",
  //   description: "多种算法的哈希计算",
  //   icon: "pluginIcons-哈希",
  //   ico: "icons/哈希.ico",
  //   defaultShortcut: "Alt+F",
  //   type: "tool",
  //   key: "fileHasher",
  //   showHeader: true,
  //   component: FileHasher,
  // },
  {
    id: 2,
    name: "sql日志转化",
    ico: "icons/sql.ico",
    description: "用于docker日志的sql转化",
    icon: "pluginIcons-sql",
    defaultShortcut: "Ctrl+Alt+5",
    type: "tool",
    key: "sqlConverter",
    showHeader: true,
    component: defineAsyncComponent(() => import("@/views/plugins/jsonEditor/index.vue")),
  },
  {
    id: 3,
    name: "nginx格式化",
    ico: "icons/nginx.ico",
    description: "nginx格式化",
    icon: "pluginIcons-nginx",
    defaultShortcut: "Ctrl+N",
    type: "tool",
    key: "nginxFormater",
    showHeader: true,
    component: NginxFormater,
  },
  // {
  //   id: 3,
  //   name: "ai固定提示词",
  //   description: "翻译中文到英文并转化为驼峰格式",
  //   icon: "pluginIcons-翻译",
  //   defaultShortcut: "trans 文本",
  //   type: "tool",
  //   key: "aiFixedTips",
  //   component: AiFixedTips,
  // },
  {
    id: 4,
    name: "JSON 格式化",
    description: "格式化和验证 JSON 数据",
    icon: "pluginIcons-json",
    ico: "icons/json.ico",
    defaultShortcut: "Ctrl+R",
    type: "tool",
    key: "jsonEditor",
    showHeader: true,
    component: JsonEditor,
  },
  {
    id: 5,
    name: "剪贴板",
    description: "获取和管理剪贴板内容",
    icon: "pluginIcons-剪贴板",
    defaultShortcut: "Ctrl+1",
    type: "tool",
    key: "clipboard",
    showHeader: true,
    component: Clipboard,
  },
  // {
  //   id: 6,
  //   name: "备忘",
  //   description: "备忘录",
  //   icon: "pluginIcons-备忘录",
  //   defaultShortcut: "md 内容",
  //   type: "tool",
  //   key: "",
  // },
  {
    id: 7,
    name: "系统信息",
    description: "系统信息",
    icon: "pluginIcons-系统信息",
    ico: "icons/系统信息.ico",
    defaultShortcut: "Ctrl+Alt+4",
    type: "tool",
    key: "systemInfo",
    showHeader: true,
    component: SystemInfo,
  },
  {
    id: 8,
    name: "文件树",
    description: "文件树",
    icon: "pluginIcons-文件树",
    ico: "icons/文件树.ico",
    defaultShortcut: "Ctrl+T",
    type: "tool",
    key: "fileTreeJson",
    showHeader: true,
    component: FileTreeJson,
  },
  {
    id: 9,
    name: "文件整理",
    description: "文件整理",
    icon: "pluginIcons-文件整理",
    ico: "icons/文件整理.ico",
    defaultShortcut: "Ctrl+Alt+3",
    type: "tool",
    key: "fileOrganizer",
    showHeader: true,
    component: FileOrganizer,
  },
  {
    id: 10,
    name: "批量正则",
    description: "批量正则",
    icon: "pluginIcons-正则",
    ico: "icons/正则.ico",
    defaultShortcut: "Ctrl+Alt+1",
    type: "tool",
    key: "batchRegex",
    showHeader: true,
    component: BatchRegex,
  },
  {
    id: 11,
    name: "代码生成",
    description: "代码生成",
    icon: "pluginIcons-代码",
    ico: "icons/代码.ico",
    defaultShortcut: "Ctrl+Alt+2",
    type: "tool",
    key: "codeGenerator",
    showHeader: true,
    component: codeGenerator,
  },
  {
    id: 12,
    name: "取色",
    description: "取色",
    icon: "pluginIcons-取色",
    ico: "icons/取色.ico",
    defaultShortcut: "Alt+1",
    type: "tool",
    key: "colorExtraction",
    showHeader: false,
    transparent: true,
    fullscreen: true,
    alwaysOnTop: true,
    newWindow: true,
    component: ColorExtraction,
  },
  {
    id: 13,
    name: "截图",
    description: "截图",
    icon: "pluginIcons-截图",
    defaultShortcut: "Ctrl+W",
    showHeader: false,
    transparent: true,
    type: "tool",
    fullscreen: true,
    alwaysOnTop: false,
    newWindow: true,
    closeHiden: true,
    key: "screenshot",
    component: Screenshot,
  },
  {
    id: 14,
    name: "截图并悬浮",
    description: "截图并悬浮",
    icon: "pluginIcons-截图并悬浮",
    defaultShortcut: "Ctrl+Q",
    showHeader: false,
    transparent: true,
    type: "tool",
    fullscreen: true,
    alwaysOnTop: false,
    newWindow: true,
    key: "screenshotAndSuspended",
    component: ScreenshotAndSuspended,
  },
  {
    id: 15,
    name: "翻译",
    description: "翻译",
    icon: "pluginIcons-翻译",
    defaultShortcut: "Ctrl+Q",
    showHeader: false,
    transparent: true,
    type: "tool",
    fullscreen: true,
    alwaysOnTop: false,
    newWindow: true,
    key: "translation",
    component: Translation,
  },
];

export const assistPlugins = [
  {
    id: 15,
    hideen: true,
    name: "图片",
    description: "图片",
    key: "image",
    showHeader: false,
    component: Image,
  },
];

export const getPluginByKey = (key: string) => {
  const plugin = [...pluginData, ...assistPlugins].find((item) => {
    // console.log(item.key, key);
    return item.key === key;
  });
  return plugin;
};
