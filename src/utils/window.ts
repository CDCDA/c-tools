import { getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window";
export const currentWindow = getCurrentWindow();

// 防抖函数，防止频繁调整
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 获取内容尺寸并调整窗口
export const adjustWindowSize = async () => {
  let content = document.querySelector(".home-container");
  if (!content) {
    console.warn("未找到 .home-container 元素");
    return;
  }

  try {
    // 等待一帧确保布局稳定
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // 获取内容的实际尺寸
    const rect = content.getBoundingClientRect();
    let width = Math.ceil(rect.width);
    let height = Math.ceil(rect.height);

    if (!width || !height) {
      console.warn("获取到的尺寸无效:", { width, height });
      return;
    }

    // console.log("内容尺寸:", { width, height });

    // 考虑头部和其他元素的高度
    const header = document.querySelector(".header-bar");
    const pluginListContainer = document.querySelector(".plugin-list-container");

    if (header && pluginListContainer) {
      const headerHeight = Math.ceil(header.getBoundingClientRect().height);
      const pluginHeight = Math.ceil(pluginListContainer.getBoundingClientRect().height);
      const totalHeight = headerHeight + pluginHeight;

      // console.log("各元素高度:", { headerHeight, pluginHeight, totalHeight });

      if (totalHeight > height) {
        height = totalHeight;
      }
    }

    // 添加一些边距或最小尺寸限制
    const minWidth = 400;
    const minHeight = 300;

    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

    // console.log("最终窗口尺寸:", { width, height: height - 15 });

    // 调整窗口大小 - 使用 Logical 尺寸可能更稳定
    await currentWindow.setSize({
      type: "Physical",
      width: width,
      height: height - 35, // 你原来的调整
    } as any);

    // console.log("窗口大小调整成功");
  } catch (error: any) {
    console.error("调整窗口大小失败:", error);
  }
};

// 防抖版本的调整函数
export const debouncedAdjustWindowSize = debounce(adjustWindowSize, 100);

// 直接设置窗口尺寸
export const setWindowSize = async (width: number, height: number) => {
  const finalWidth = Math.max(Math.ceil(width || 800));
  const finalHeight = Math.max(Math.ceil(height || 600));

  // console.log("设置窗口尺寸:", { finalWidth, finalHeight });

  try {
    await currentWindow.setSize({
      type: "Physical",
      width: finalWidth,
      height: finalHeight,
    } as any);
    // console.log("窗口尺寸设置成功");
  } catch (error: any) {
    console.error("设置窗口大小失败:", error);
  }
};

export const setWindowPosition = async (x: number, y: number) => {
  const finalX = Math.max(Math.ceil(x || 0));
  const finalY = Math.max(Math.ceil(y || 0));
  try {
    await currentWindow.setPosition({
      type: "Physical",
      x: finalX,
      y: finalY,
    } as any);
  } catch (error: any) {
    console.error("设置窗口位置失败:", error);
  }
};

const getScreenSize = async () => {
  const monitor = (await primaryMonitor()) as any;
  return monitor.size;
};

export const setFullscreen = async () => {
  const { width, height } = await getScreenSize();
  setWindowSize(width, height);
  setWindowPosition(-2, 0);
};

export const close = async () => {
  await currentWindow.close();
};

export const minimize = async () => {
  await currentWindow.minimize();
};
