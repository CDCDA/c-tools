import FileHasher from "@/views/plugins/fileHasher/index.vue";
import SqlConverter from "@/views/plugins/sqlConverter/index.vue";
import JsonEditor from "@/views/plugins/jsonEditor/index.vue";
// import AiFixedTips from "@/views/plugins/aiFixedTips/index.vue";
import Clipboard from "@/views/plugins/clipboard/index.vue";
import SystemInfo from "@/views/plugins/systemInfo/index.vue";
import FileOrganizer from "@/views/plugins/fileOrganizer/index.vue";
import FileTreeJson from "@/views/plugins/fileTreeJson/index.vue";
import NginxFormater from "@/views/plugins/nginxFormater/index.vue";
import BatchRegex from "@/views/plugins/batchRegex/index.vue";
import codeGenerator from "@/views/plugins/codeGenerator/index.vue";
import ColorExtraction from "@/views/plugins/colorExtraction/index.vue";

export const pluginData = [
  {
    id: 1,
    name: "哈希计算",
    description: "多种算法的哈希计算",
    icon: "pluginIcons-哈希",
    ico: "icons/哈希.ico",
    shortcut: "Alt+F",
    type: "tool",
    key: "fileHasher",
    showHeader: true,
    component: FileHasher,
  },
  {
    id: 2,
    name: "sql日志转化",
    ico: "icons/sql.ico",
    description: "用于docker日志的sql转化",
    icon: "pluginIcons-sql",
    shortcut: "= 表达式",
    type: "tool",
    key: "sqlConverter",
    showHeader: true,
    component: SqlConverter,
  },
  {
    id: 3,
    name: "nginx格式化",
    ico: "icons/nginx.ico",
    description: "nginx格式化",
    icon: "pluginIcons-nginx",
    shortcut: "= 表达式",
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
  //   shortcut: "trans 文本",
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
    shortcut: "json 内容",
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
    shortcut: "ts 时间戳",
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
  //   shortcut: "md 内容",
  //   type: "tool",
  //   key: "",
  // },
  {
    id: 7,
    name: "系统信息",
    description: "系统信息",
    icon: "pluginIcons-系统信息",
    ico: "icons/系统信息.ico",
    shortcut: "md 内容",
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
    shortcut: "md 内容",
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
    shortcut: "md 内容",
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
    shortcut: "md 内容",
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
    shortcut: "md 内容",
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
    shortcut: "md 内容",
    type: "tool",
    key: "colorExtraction",
    showHeader: false,
    transparent: true,
    fullscreen: true,
    alwaysOnTop: true,
    newWindow: true,
    width: 0,
    height: 0,
    component: ColorExtraction,
  },
];

export const getPluginByKey = (key: string) => {
  // console.log(key);
  const plugin = pluginData.find((item) => {
    console.log(item.key, key);
    return item.key === key;
  });
  // console.log(plugin);
  return plugin;
};
