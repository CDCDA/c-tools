/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module "@tauri-apps/plugin-fs";
declare module "@tauri-apps/api";
declare module "vue-router";
declare module "vite-plugin-monaco-editor";
declare module "@/utils/*.ts";
declare module "js-beautify";
declare module "@/api/*.ts";
declare module "sortablejs";
declare module "@/components/editor/useCodeMirror.js";
declare module "@/windows/index.js";
declare module "@/store/modules/*.ts";
