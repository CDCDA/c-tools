import { defineAsyncComponent, type Component } from "vue";

type HeaderComponent = Component | string;

const headerRegistry: Record<string, HeaderComponent> = {
  browser: defineAsyncComponent(() => import("./browserHeader.vue")),
  search: defineAsyncComponent(() => import("./searchHeader.vue")),
};

export function getHeaderComponent(name: string): HeaderComponent | undefined {
  return headerRegistry[name];
}

export function registerHeader(name: string, component: HeaderComponent) {
  headerRegistry[name] = component;
}

export function getRegisteredHeaders(): string[] {
  return Object.keys(headerRegistry);
}
