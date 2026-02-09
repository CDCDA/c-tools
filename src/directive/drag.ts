import { Directive } from "vue";

export const vDrag: Directive = {
  mounted(el: HTMLElement, binding: any) {
    const options = binding.value || {};
    const { dragSelf = false, handle, target } = options;

    // 获取手柄和目标
    const handleEl = (handle ? el.querySelector(handle) : el) as HTMLElement;
    const dragDom = (dragSelf ? el : target ? el.querySelector(target) : el) as HTMLElement;

    if (!handleEl || !dragDom) return;

    handleEl.style.cursor = "move";

    handleEl.onmousedown = (e: MouseEvent) => {
      // 1. 获取点击时，点击点相对于元素左上角的坐标
      // getBoundingClientRect 始终返回相对于视口的像素值，不受 calc 或 % 影响
      const rect = dragDom.getBoundingClientRect();

      // 鼠标按下位置相对于元素左上角的偏移
      const disX = e.clientX - rect.left;
      const disY = e.clientY - rect.top;

      // 防止拖拽时选中文本
      document.onselectstart = () => false;

      document.onmousemove = (moveEvent: MouseEvent) => {
        // 2. 计算新位置：当前鼠标位置 - 初始偏移量
        let left = moveEvent.clientX - disX;
        let top = moveEvent.clientY - disY;

        // 3. (可选) 边界限制：防止拖出屏幕
        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        const dragDomWidth = dragDom.offsetWidth;
        const dragDomHeight = dragDom.offsetHeight;

        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + dragDomWidth > screenWidth) left = screenWidth - dragDomWidth;
        if (top + dragDomHeight > screenHeight) top = screenHeight - dragDomHeight;

        // 4. 应用样式
        // 注意：必须清除可能存在的 right 和 bottom，否则 position: fixed 会失效
        dragDom.style.left = `${left}px`;
        dragDom.style.top = `${top}px`;
        dragDom.style.bottom = "auto";
        dragDom.style.right = "auto";
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        document.onselectstart = null;
      };
    };
  },
};
