import { getCurrentWindow, primaryMonitor, LogicalSize, PhysicalSize } from "@tauri-apps/api/window";

export const currentWindow = getCurrentWindow();

// 获取当前 DPI 缩放因子
export const getScaleFactor = async (): Promise<number> => {
  try {
    return await currentWindow.scaleFactor();
  } catch (error) {
    console.warn("获取缩放因子失败，使用默认值 1:", error);
    return 1;
  }
};

// 将逻辑尺寸转换为物理尺寸
export const logicalToPhysical = async (
  logicalWidth: number,
  logicalHeight: number
): Promise<{ width: number; height: number }> => {
  const scaleFactor = await getScaleFactor();
  return {
    width: Math.round(logicalWidth * scaleFactor),
    height: Math.round(logicalHeight * scaleFactor),
  };
};

// 将物理尺寸转换为逻辑尺寸
export const physicalToLogical = async (
  physicalWidth: number,
  physicalHeight: number
): Promise<{ width: number; height: number }> => {
  const scaleFactor = await getScaleFactor();
  return {
    width: Math.round(physicalWidth / scaleFactor),
    height: Math.round(physicalHeight / scaleFactor),
  };
};

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 监听 DPI 缩放变化
export const setupDPIMonitor = (callback: (scaleFactor: number) => void) => {
  const unlisten = currentWindow.onScaleChanged(({ scaleFactor }: any) => {
    console.log("DPI 缩放因子变化:", scaleFactor);
    callback(scaleFactor);
  });
  return unlisten;
};

// 获取内容尺寸并调整窗口（DPI 感知版本）
export const adjustWindowSize = async () => {
  let content = document.querySelector(".home-container");
  if (!content) {
    console.warn("未找到 .home-container 元素");
    return;
  }

  try {
    // 等待一帧确保布局稳定
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // 获取内容的实际逻辑尺寸
    const rect = content.getBoundingClientRect();
    let logicalWidth = Math.ceil(rect.width);
    let logicalHeight = Math.ceil(rect.height);

    if (!logicalWidth || !logicalHeight) {
      console.warn("获取到的尺寸无效:", { logicalWidth, logicalHeight });
      return;
    }

    // console.log("内容逻辑尺寸:", { logicalWidth, logicalHeight });

    // 考虑头部和其他元素的高度
    const header = document.querySelector(".header-bar");
    const pluginListContainer = document.querySelector(".plugin-list-container");

    if (header && pluginListContainer) {
      const headerHeight = Math.ceil(header.getBoundingClientRect().height);
      const pluginHeight = Math.ceil(pluginListContainer.getBoundingClientRect().height);
      const totalHeight = headerHeight + pluginHeight;

      if (totalHeight > logicalHeight) {
        logicalHeight = totalHeight;
      }
    }

    // 添加一些边距或最小逻辑尺寸限制
    const minLogicalWidth = 400;
    const minLogicalHeight = 300;

    logicalWidth = Math.max(logicalWidth, minLogicalWidth);
    logicalHeight = Math.max(logicalHeight, minLogicalHeight);

    // 转换为物理尺寸
    const scaleFactor = await getScaleFactor();
    const physicalWidth = Math.round(logicalWidth * scaleFactor);
    const physicalHeight = Math.round(logicalHeight * scaleFactor) - 35;

    // console.log("转换结果:", {
    //   logicalWidth,
    //   logicalHeight,
    //   scaleFactor,
    //   physicalWidth,
    //   physicalHeight,
    // });

    // 方法1：使用逻辑尺寸设置（推荐，更稳定）
    try {
      const logicalSize = new LogicalSize(logicalWidth, logicalHeight);
      await currentWindow.setSize(logicalSize);
      // console.log("使用逻辑尺寸设置成功");
    } catch (error) {
      // 如果逻辑尺寸失败，回退到物理尺寸
      console.warn("逻辑尺寸设置失败，使用物理尺寸:", error);
      const physicalSize = new PhysicalSize(physicalWidth, physicalHeight);
      await currentWindow.setSize(physicalSize);
    }
  } catch (error: any) {
    console.error("调整窗口大小失败:", error);
  }
};

// 防抖版本的调整函数
export const debouncedAdjustWindowSize = debounce(adjustWindowSize, 100);

// DPI 感知的直接设置窗口尺寸
export const setWindowSize = async (width: number, height: number, useLogicalSize = true) => {
  try {
    const finalWidth = Math.max(Math.ceil(width || 800));
    const finalHeight = Math.max(Math.ceil(height || 600));

    if (useLogicalSize) {
      // 直接使用逻辑尺寸
      const logicalSize = new LogicalSize(finalWidth, finalHeight);
      await currentWindow.setSize(logicalSize);
      // console.log("使用逻辑尺寸设置:", { finalWidth, finalHeight });
    } else {
      // 使用物理尺寸（明确指定）
      const scaleFactor = await getScaleFactor();
      const physicalWidth = Math.round(finalWidth * scaleFactor);
      const physicalHeight = Math.round(finalHeight * scaleFactor);
      const physicalSize = new PhysicalSize(physicalWidth, physicalHeight);
      await currentWindow.setSize(physicalSize);
      // console.log("使用物理尺寸设置:", { physicalWidth, physicalHeight });
    }
  } catch (error: any) {
    console.error("设置窗口大小失败:", error);
  }
};

// DPI 感知的设置窗口位置
export const setWindowPosition = async (x: number, y: number, useLogicalPosition = true) => {
  try {
    const finalX = Math.max(Math.ceil(x || 0));
    const finalY = Math.max(Math.ceil(y || 0));

    if (useLogicalPosition) {
      // 使用逻辑位置
      await currentWindow.setPosition({
        type: "Logical",
        x: finalX,
        y: finalY,
      } as any);
    } else {
      // 使用物理位置
      const scaleFactor = await getScaleFactor();
      const physicalX = Math.round(finalX * scaleFactor);
      const physicalY = Math.round(finalY * scaleFactor);
      await currentWindow.setPosition({
        type: "Physical",
        x: physicalX,
        y: physicalY,
      } as any);
    }
  } catch (error: any) {
    console.error("设置窗口位置失败:", error);
  }
};

// 获取屏幕尺寸（逻辑尺寸）
const getScreenSize = async (): Promise<{ width: number; height: number }> => {
  try {
    const monitor = await primaryMonitor();
    if (!monitor) {
      throw new Error("无法获取主显示器信息");
    }

    // 获取物理尺寸
    const physicalSize = monitor.size;
    const scaleFactor = monitor.scaleFactor || 1;

    // 转换为逻辑尺寸
    return {
      width: Math.round(physicalSize.width / scaleFactor),
      height: Math.round(physicalSize.height / scaleFactor),
    };
  } catch (error) {
    console.error("获取屏幕尺寸失败:", error);
    // 返回默认值
    return { width: 1920, height: 1080 };
  }
};

// DPI 感知的全屏设置
export const setFullscreen = async () => {
  try {
    // 使用逻辑尺寸设置全屏
    const { width: logicalWidth, height: logicalHeight } = await getScreenSize();

    // 方法1：直接使用逻辑尺寸
    const logicalSize = new LogicalSize(logicalWidth, logicalHeight);
    await currentWindow.setSize(logicalSize);

    // 位置设置为屏幕左上角
    await currentWindow.setPosition({
      type: "Logical",
      x: 0,
      y: 0,
    } as any);

    // 或者方法2：最大化窗口（更简单）
    // await currentWindow.maximize();

    // console.log("全屏设置完成，逻辑尺寸:", { logicalWidth, logicalHeight });
  } catch (error) {
    console.error("设置全屏失败:", error);
  }
};

// 初始化 DPI 感知
export const initializeDPIAwareness = async () => {
  try {
    const scaleFactor = await getScaleFactor();
    console.log("当前 DPI 缩放因子:", scaleFactor);

    // 设置 CSS 变量，方便前端使用
    document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());

    // 监听 DPI 变化
    setupDPIMonitor((newScaleFactor) => {
      document.documentElement.style.setProperty("--scale-factor", newScaleFactor.toString());
      // DPI 变化时自动调整窗口
      debouncedAdjustWindowSize();
    });

    return scaleFactor;
  } catch (error) {
    console.error("初始化 DPI 感知失败:", error);
    return 1;
  }
};

// 获取窗口当前尺寸（逻辑尺寸）
export const getWindowSize = async (): Promise<{ width: number; height: number }> => {
  try {
    const size = await currentWindow.innerSize();
    const scaleFactor = await getScaleFactor();

    // 转换为逻辑尺寸
    return {
      width: Math.round(size.width / scaleFactor),
      height: Math.round(size.height / scaleFactor),
    };
  } catch (error) {
    console.error("获取窗口尺寸失败:", error);
    return { width: 0, height: 0 };
  }
};

// CSS 工具函数，用于 DPI 适配
export const applyDPIStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    /* DPI 缩放适配 */
    :root {
      --scale-factor: 1;
    }
    
    /* 对于高 DPI 屏幕，提高字体清晰度 */
    @media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
    
    /* 如果需要在 CSS 中根据缩放调整尺寸 */
    .dpi-aware-element {
      transform: scale(calc(1 / var(--scale-factor, 1)));
      transform-origin: 0 0;
    }
  `;
  document.head.appendChild(style);
};

export const close = async () => {
  await currentWindow.close();
};

export const minimize = async () => {
  await currentWindow.minimize();
};
