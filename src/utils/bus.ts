import mitt from "mitt";

type Events = {
  "execute-plugin-action": { pluginId: string; actionId: string; payload?: any };
  "refresh-shortcuts": void;
  "show-toast": string;
  "shell-command": { scriptId: string; args?: Record<string, string> };
  "separate-plugin-window": { pluginId: string; payload?: any };
};

export const bus = mitt<Events>();
