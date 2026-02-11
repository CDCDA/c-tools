import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http"; // 建议使用 Tauri 的 fetch 处理跨域

export const translate = async (params: any) => {
  const response = await invoke<string>("translate_text", params);
  return response;
};

export const quickTranslate = async (zhText: string) => {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      connectTimeout: 3000,
      body: JSON.stringify({
        model: "var-fix",
        prompt: zhText,
        stream: false,
        // 关键：-1 让模型留在内存，避免下次请求还要花 300ms 加载模型
        keep_alive: -1,
      }),
    });

    if (!response.ok) return null;

    const data: any = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("翻译接口异常:", error);
    return null;
  }
};
