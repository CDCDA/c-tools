<template>
  <div class="page-main webview-plugin">
    <div class="url-input-container" v-if="!currentUrl">
      <div class="empty-hint">请在顶部输入网址访问</div>
    </div>
    <div ref="webviewContainerRef" class="webview-container" v-else>
      <div class="loading">正在加载...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { ElNotification } from "element-plus";
import { Webview } from "@tauri-apps/api/webview"
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/window";
import { getPluginData, savePluginData } from "@/utils/localSave.ts";

const inputUrl = ref("");
const currentUrl = ref("");
const webviewContainerRef = ref<HTMLDivElement | null>(null);
const history = ref<string[]>([]);
const historyIndex = ref(-1);
let webviewWindow: any = null;
let resizeObserver: ResizeObserver | null = null;

const STORAGE_KEY = "browser";

onMounted(async () => {
  const savedData = await getPluginData(STORAGE_KEY);
  if (savedData?.lastUrl) {
    handleNavigate(savedData.lastUrl);
  }
});

const handleNavigate = async (url: string) => {
  if (!url) {
    ElNotification.warning("请先输入网址");
    return;
  }

  let finalUrl = url;
  if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
    finalUrl = "https://" + finalUrl;
  }

  await savePluginData(STORAGE_KEY, { lastUrl: finalUrl });
  navigateTo(finalUrl);
};

defineExpose({
  handleNavigate,
  inputUrl
});

const navigateTo = async (url: string) => {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  history.value.push(url);
  historyIndex.value = history.value.length - 1;
  currentUrl.value = url;
  inputUrl.value = url;

  await nextTick();
  await loadWebview(url);
};

const loadWebview = async (url: string) => {
  try {
    const currentWindow = getCurrentWindow();
    const rect = webviewContainerRef.value?.getBoundingClientRect();

    if (!rect) {
      ElNotification.error("无法获取容器尺寸");
      return;
    }

    if (webviewWindow) {
      await webviewWindow.close();
    }

    webviewWindow = new Webview(currentWindow, `content-browser`, {
      url: url,
      x: 0,
      y: 42,
      width: rect.width,
      height: rect.height,
    });

    webviewWindow.once('tauri://created', () => {
      console.log('原生 Webview 创建成功');
      webviewWindow?.show();
      // webviewWindow.setAutoResize(true);
      console.log('webviewContainerRef.value', webviewContainerRef.value);

      if (webviewContainerRef.value) {
        resizeObserver = new ResizeObserver(() => {
          updateWebviewSize();
        });
        resizeObserver.observe(webviewContainerRef.value);
      }
    });

    webviewWindow.once('tauri://error', (e: any) => {
      console.error('原生 Webview 创建失败:', e);
    });
  } catch (e) {
    console.error("Webview加载失败:", e);
    ElNotification.error("加载失败: " + e);
  }
};

const updateWebviewSize = async () => {
  if (!webviewWindow || !webviewContainerRef.value) return;

  const rect = webviewContainerRef.value.getBoundingClientRect();

  try {
    // 同步尺寸
    await webviewWindow.setSize(new LogicalSize(
      Math.round(rect.width),
      Math.round(rect.height)
    ));

    // 同步位置 (x, y 会根据 DOM 元素位置自动偏移，避开 Header)
    await webviewWindow.setPosition(0, 42);
  } catch (e) {
    console.error("Layout Sync Failed:", e);
  }
};


onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (webviewWindow) {
    webviewWindow.close();
    webviewWindow = null;
  }
});
</script>

<style lang="scss" scoped>
.webview-plugin {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;

  .webview-container {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .loading {
      font-size: 14px;
      color: #999;
    }
  }

  .url-input-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .empty-hint {
      font-size: 16px;
      color: #999;
    }

    .url-input {
      width: 80%;
      max-width: 600px;
      margin-bottom: 80px;

      :deep(.el-input__wrapper) {
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .url-tip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-top: 20px;

      .tip-text {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
