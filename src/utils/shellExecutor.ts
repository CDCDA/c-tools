import { Command } from "@tauri-apps/plugin-shell";
import { ElNotification } from "element-plus";

export async function executeScript(script: any, params: Record<string, string>) {
  let finalCmd = script.command;

  // 1. 替换占位符
  Object.keys(params).forEach((key) => {
    finalCmd = finalCmd.replaceAll(`{{${key}}}`, params[key]);
  });

  try {
    if (script.shell === "powershell") {
      const psArg = `Start-Process powershell -ArgumentList '-NoProfile','-NoExit','-Command','${finalCmd.replace(/'/g, "''")}'`;
      await Command.create("powershell", ["-NoProfile", "-Command", psArg]).execute();
    } else {
      await Command.create("exec-cmd", ["/c", "start", "", "cmd", "/k", finalCmd]).execute();
    }
    ElNotification.success("脚本已启动");
  } catch (error) {
    ElNotification.error(`执行失败: ${error}`);
  }
}
