export const copyImgToClipboard = async (src: any) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error("复制失败:", error);
  }
};
