import { fetch } from "@tauri-apps/plugin-http";

export const sendMessage = async (messages: any, options: any) => {
  const requestBody = {
    messages: messages,
    stream: options.stream,
    model: options.modelId,
    temperature: options.temperature || 0.2,
    max_tokens: 4096,
  };
  console.log("options", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
      Authorization: `Bearer ${options.apiKey}`,
    },
    method: "POST",
    body: JSON.stringify(requestBody),
  });
  return await fetch(`${options.baseUrl}/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
      Authorization: `Bearer ${options.apiKey}`,
    },
    method: "POST",
    body: JSON.stringify(requestBody),
  });
};
