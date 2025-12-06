import { invoke } from "@tauri-apps/api/core";
export const translate = async (params:any) => {

   const response = await invoke<string>('translate_text', params);
   return response;
};