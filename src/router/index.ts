import { createRouter, createWebHashHistory } from "vue-router";

const routes: Array<any> = [
  {
    path: "/login",
    name: "login",
    meta: { label: "登录", isHidden: true, cache: false },
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/home",
    name: "home",
    meta: { label: "主页", isHidden: true, cache: false },
    component: () => import("@/views/home/index.vue"),
  },
  {
    path: "/pluginList",
    name: "pluginList",
    meta: { label: "应用查询", preload: true },
    component: () => import(/* webpackChunkName: "about" */ "/src/views/plugins/pluginList.vue"),
  },
  {
    path: "/plugin",
    name: "plugin",
    meta: { label: "插件应用(独立窗口)", preload: true },
    component: () => import("@/views/plugins/index.vue"),
    redirect: "/clipboard",
    children: [
      {
        path: "/clipboard",
        name: "clipboard",
        meta: { label: "剪贴板", preload: true },
        component: () => import("@/views/plugins/clipboard/index.vue"),
      },
      {
        path: "/fileHasher",
        name: "fileHasher",
        meta: { label: "文件哈希", preload: true },
        component: () => import("@/views/plugins/fileHasher/index.vue"),
      },
      {
        path: "/jsonEditor",
        name: "jsonEditor",
        meta: { label: "JSON编辑器", preload: true },
        component: () => import("@/views/plugins/jsonEditor/index.vue"),
      },
      {
        path: "/sqlConverter",
        name: "sqlConverter",
        meta: { label: "sql日志转换", preload: true },
        component: () => import("@/views/plugins/sqlConverter/index.vue"),
      },
      {
        path: "/systemInfo",
        name: "systemInfo",
        meta: { label: "系统信息", preload: true },
        component: () => import("@/views/plugins/systemInfo/index.vue"),
      },
      {
        path: "/fileTreeJson",
        name: "fileTreeJson",
        meta: { label: "文件树", preload: true },
        component: () => import("@/views/plugins/fileTreeJson/index.vue"),
      },
      {
        path: "/fileOrganizer",
        name: "fileOrganizer",
        meta: { label: "文件整理", preload: true },
        component: () => import("@/views/plugins/fileOrganizer/index.vue"),
      },
    ],
  },
  {
    path: "/manage",
    name: "manage",
    meta: { label: "设置", isHidden: true },
    component: () => import("/src/views/manage/index.vue"),
    children: [
      {
        path: "/person",
        name: "person",
        meta: {
          label: "个人中心",
          isHidden: true,
          svgIcon: "pluginSvg-sql",
          src: "/images/manageImages/用户.png",
          affix: true,
        },
        children: [
          {
            path: "/account",
            name: "account",
            meta: {
              label: "我的账号",
              isHidden: true,
              svgIcon: "pluginIcons-sql",
              src: "/images/manageImages/用户.png",
              affix: true,
            },
            component: () => import("/src/views/manage/account/index.vue"),
          },

          {
            path: "/localData",
            name: "localData",
            meta: {
              label: "本地数据",
              isHidden: true,
              svgIcon: "pluginSvg-sql",
              src: "/images/manageImages/用户.png",
              affix: true,
            },
            component: () => import("/src/views/manage/localData/index.vue"),
          },
        ],
      },
      {
        path: "/Preference",
        name: "Preference",
        meta: {
          label: "偏好设置",
          isHidden: true,
          svgIcon: "pluginSvg-sql",
          src: "/images/manageImages/用户.png",
          affix: true,
        },
        children: [
          {
            path: "/config",
            name: "config",
            meta: {
              label: "设置",
              isHidden: true,
              svgIcon: "pluginSvg-设置",
              src: "/images/manageImages/设置.png",
              affix: true,
            },
            component: () => import("/src/views/manage/config/index.vue"),
          },
          {
            path: "/aiModel",
            name: "aiModel",
            meta: {
              label: "AI管理",
              isHidden: true,
              svgIcon: "pluginSvg-设置",
              src: "/images/manageImages/设置.png",
              affix: true,
            },
            component: () => import("/src/views/manage/aiModel/index.vue"),
          },
          {
            path: "/shortcutKey",
            name: "shortcutKey",
            meta: {
              label: "快捷键",
              isHidden: true,
              svgIcon: "pluginSvg-sql",
              src: "/images/manageImages/用户.png",
              affix: true,
            },
            component: () => import("/src/views/manage/shortcutKey/index.vue"),
          },
        ],
      },
    ],
  },
];
const router = createRouter({
  history: createWebHashHistory("/"),
  routes,
});

export default router;
