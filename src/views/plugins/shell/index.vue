<template>
  <div class="page-main shell-container">

    <!-- 脚本列表 -->
    <List :list="realScripts">
      <template #default="{ item }">
        <div class="c-list-item-content" @click="handleClick(item)">{{ item.command }}</div>
        <div class="c-title flex-between">
          <div class="title">{{ item.name }}</div>
          <div class="tools">
            <el-tooltip class="item" effect="dark" content="执行脚本">
              <el-icon @click="playVideo(item)">
                <VideoPlay />
              </el-icon>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="编辑脚本">
              <el-icon @click="editItem(item)">
                <Edit />
              </el-icon>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除脚本">
              <el-icon @click="deleteItem(item)">
                <Delete />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
    </List>
    <FloatButtons type="normal">
      <template #base-btn>
        <div class="base-btn" @click="openDrawer()">
          <el-icon class="plus-icon">
            <Plus />
          </el-icon>
        </div>
      </template>
    </FloatButtons>

    <!-- 新增/编辑抽屉 -->
    <el-drawer v-model="drawerVisible" :title="form.id ? '编辑脚本' : '新增脚本'" size="70%">
      <el-form :model="form" label-width="5rem">
        <el-collapse v-model="activeCollapseNames">
          <el-collapse-item title="基础信息" name="1">
            <el-form-item label="脚本名称">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="快捷键">
              <ShortcutInput v-model="form.shortcut" @change="handleShortcutChange(scope.row, 'global')" />
            </el-form-item>
            <el-form-item label="执行环境">
              <el-radio-group v-model="form.shell">
                <el-radio-button label="powershell">PowerShell</el-radio-button>
                <el-radio-button label="cmd">CMD</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item title="脚本内容" name="2">
            <el-form-item label="脚本命令">
              <editor ref="editorOutputRef" style="min-height: 300px;" class="editor" v-model="form.command"
                language="shell" placeholder="支持占位符，例如: taskkill /F /PID {{pid}}" />
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item title="参数管理" name="3">
            <div v-for="(arg, index) in form.args" :key="index" class="arg-row">
              <el-input v-model="arg.key" placeholder="参数Key (如: port)" size="small" />
              <el-input v-model="arg.defaultValue" placeholder="默认值" size="small" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="form.args.splice(index, 1)" />
            </div>
            <el-button type="dashed" style="width: 100%; margin-top: 10px"
              @click="form.args.push({ key: '', defaultValue: '' })">
              + 添加参数
            </el-button>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveScript">保存脚本</el-button>
      </template>
    </el-drawer>

    <!-- 执行前的参数确认弹窗 -->
    <el-dialog v-model="runDialogVisible" title="确认参数" width="400px">
      <el-form label-width="80px">
        <el-form-item v-for="arg in activeScript?.args" :key="arg.key" :label="arg.key">
          <el-input v-model="runParams[arg.key]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="executeFinal">确认执行</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import { Command } from '@tauri-apps/plugin-shell';
import { savePluginData, getPluginData } from "@/utils/localSave.ts";
import List from "@/components/list/index.vue";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import Editor from "@/components/editor/index.vue";
import ShortcutInput from "@/components/shortcut/shortcutInput.vue";

import FloatButtons from '@/components/floatButtons/index.vue';
import { Plus, VideoPlay, Edit, Delete } from "@element-plus/icons-vue";
// 数据类型定义
interface ScriptArg {
  key: string;
  defaultValue: string;
}

interface CustomScript {
  id: string;
  name: string;
  shell: 'powershell' | 'cmd';
  command: string;
  args: ScriptArg[];
  createdAt: number;
}

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入脚本名称", trigger: "blur" }],
  command: [{ required: true, message: "请输入脚本内容", trigger: "blur" }],
};

// 状态变量
const scripts = ref<CustomScript[]>([]);
const drawerVisible = ref(false);
const runDialogVisible = ref(false);
const activeScript = ref<CustomScript | null>(null);
const runParams = ref<Record<string, string>>({});
const activeCollapseNames = ref(["1", "2", "3"]);



// 表单初始值
const initialForm: CustomScript = {
  id: "",
  name: "",
  shell: "powershell",
  command: "",
  args: [],
  createdAt: Date.now(),
};
const form = ref<CustomScript>({ ...initialForm });

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// 打开编辑器
const openDrawer = (row?: CustomScript) => {
  if (row) {
    form.value = JSON.parse(JSON.stringify(row));
  } else {
    form.value = { ...initialForm, id: Date.now().toString(), args: [] };
  }
  drawerVisible.value = true;
};

// 编辑脚本
const editItem = (item: CustomScript) => {
  openDrawer(item);
};

// 删除脚本
const deleteItem = (item: CustomScript) => {
  ElMessageBox.confirm("确认删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteScript(item.id);
  });
};

// 执行脚本
const playVideo = (item: CustomScript) => {
  prepareToRun(item);
};

// 保存到本地
const saveScript = async () => {
  if (!form.value.name || !form.value.command) {
    ElMessage.warning("名称和命令不能为空");
    return;
  }
  const index = scripts.value.findIndex(s => s.id === form.value.id);
  if (index > -1) {
    scripts.value[index] = { ...form.value };
  } else {
    scripts.value.push({ ...form.value, createdAt: Date.now() });
  }
  await saveLocalData();
  drawerVisible.value = false;
  ElNotification.success("保存成功");
};

// 删除脚本
const deleteScript = async (id: string) => {
  scripts.value = scripts.value.filter(s => s.id !== id);
  await saveLocalData();
};

// 运行前准备：解析参数
const prepareToRun = (script: CustomScript) => {
  activeScript.value = script;
  runParams.value = {};
  script.args.forEach(arg => {
    runParams.value[arg.key] = arg.defaultValue;
  });

  if (script.args.length > 0) {
    runDialogVisible.value = true;
  } else {
    executeFinal();
  }
};

const executeFinal = async () => {
  runDialogVisible.value = false;
  if (!activeScript.value) return;

  const script = activeScript.value;
  let finalCmd = script.command as any;

  // 1. 替换占位符
  Object.keys(runParams.value).forEach(key => {
    finalCmd = finalCmd.replaceAll(`{{${key}}}`, runParams.value[key]);
  });

  try {
    if (script.shell === 'powershell') {
      // 使用 PowerShell 原生的 Start-Process
      const psArg = `Start-Process powershell -ArgumentList '-NoProfile','-NoExit','-Command','${finalCmd.replace(/'/g, "''")}'`;
      await Command.create('powershell', [
        "-NoProfile",
        "-Command",
        psArg
      ]).execute();
    } else {
      // CMD 模式
      await Command.create('exec-cmd', [
        '/c',
        'start',
        '',
        'cmd',
        '/k',
        finalCmd
      ]).execute();
    }
    ElNotification.success("已成功唤起外部终端窗口");
  } catch (error) {
    ElNotification.error(`执行出错: ${error}`);
    console.error("Execute Error:", error);
  }
};

const realScripts = computed(() => {
  if (searchText.value) {
    return scripts.value.filter(s => s.name.includes(searchText.value));
  }
  return scripts.value;
});

// 数据持久化
const saveLocalData = () => savePluginData("shell_pro", { scripts: scripts.value });
const loadLocalData = async () => {
  const data = await getPluginData("shell_pro");
  if (data && data.scripts) {
    // 确保每个脚本都有createdAt字段
    scripts.value = data.scripts.map((script: any) => ({
      ...script,
      createdAt: script.createdAt || Date.now()
    }));
  }
};
const handleClick = (item: CustomScript) => {
  writeText(item.command);
  ElNotification.success("脚本已复制到剪贴板");
}
const searchText = ref("");

function handleSearch(val: any) {
  searchText.value = val
}

onMounted(loadLocalData);

defineExpose({
  handleSearch
})
</script>

<style scoped lang="scss">
.base-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  // background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  // &:hover {
  //   background-color: #e0e0e0;
  //   transform: scale(1.05);
  // }
}

.plus-icon {
  font-size: 24px;
}

.shell-container {
  height: calc(100% - 30px);
  width: calc(100% - 30px);
  background: #fff;
}

.shell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.arg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.script-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px;
  width: 100%;

  .card-left {
    flex: 0 0 150px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .script-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .script-time {
      font-size: 12px;
      color: #999;
    }

    .script-shell {
      margin-top: 4px;
    }
  }

  .card-middle {
    flex: 1;
    min-width: 0;

    .script-content {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .card-right {
    flex: 0 0 auto;
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.hint {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.c-list-item {
  max-height: 150px;
  border-radius: 6px;

  border: 2px solid #d5d7dd;
  cursor: pointer;
  margin-bottom: 10px;
  width: calc(100% - 14px);
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: start;

  .c-list-item-content {
    height: calc(100% - 32px);
    overflow: auto;
    padding: 5px;
    color: rgb(36, 41, 46)
  }

  .c-title {
    width: calc(100% - 8px);
    border-top: 1px dashed #d5d7dd;
    margin-top: 10px;
    font-size: 15px;
    color: #756e6e;
    padding: 4px 4px 0px 4px;

    .tools {
      width: fit-content;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 16px;
        margin-left: 10px;
      }
    }
  }

  &:hover {
    border-color: var(--el-color-primary);
  }
}

.c-list-item:last-child {
  margin-bottom: 0;
}
</style>