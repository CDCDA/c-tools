<template>
  <el-input
    :model-value="modelValue"
    :placeholder="placeholder"
    readonly
    :class="{ 'is-recording': isRecording }"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template #prefix>
      <span v-if="isRecording" class="recording-indicator"></span>
    </template>
    <template #suffix>
      <el-button v-if="modelValue && !isRecording" link size="small" @click.stop="handleClear">
        <el-icon><Close /></el-icon>
      </el-button>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Close } from "@element-plus/icons-vue";

interface Props {
  modelValue?: string;
  placeholder?: string;
  // 用于检查快捷键是否重复的函数
  checkDuplicate?: (shortcut: string) => boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "请按下快捷键",
  checkDuplicate: () => false,
});

const emit = defineEmits<Emits>();

const isRecording = ref(false);
const currentKeys = ref<Set<string>>(new Set());
const lastKeyTime = ref(0);

// 修饰键映射
const modifierKeys = new Set(["Control", "Alt", "Shift", "Meta"]);
const keyMap: Record<string, string> = {
  " ": "Space",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
  Enter: "Enter",
  Tab: "Tab",
  CapsLock: "CapsLock",
  Backspace: "Backspace",
  Delete: "Delete",
  Insert: "Insert",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
};

// 处理按键按下
function handleKeyDown(event: KeyboardEvent) {
  if (!isRecording.value) return;

  event.preventDefault();
  event.stopPropagation();

  const now = Date.now();

  // 如果两次按键间隔超过1秒，清空之前的按键
  if (now - lastKeyTime.value > 1000) {
    currentKeys.value.clear();
  }
  lastKeyTime.value = now;

  // 添加修饰键
  if (event.ctrlKey) currentKeys.value.add("Ctrl");
  if (event.altKey) currentKeys.value.add("Alt");
  if (event.shiftKey) currentKeys.value.add("Shift");
  if (event.metaKey) currentKeys.value.add("Meta");

  // 添加普通按键（排除修饰键本身）
  if (!modifierKeys.has(event.key)) {
    const key = keyMap[event.key] || (event.key.length === 1 ? event.key.toUpperCase() : event.key);
    currentKeys.value.add(key);
  }

  updateShortcut();
}

// 处理按键释放
function handleKeyUp(event: KeyboardEvent) {
  if (!isRecording.value) return;

  event.preventDefault();
  event.stopPropagation();

  // 移除释放的修饰键
  if (event.key === "Control") currentKeys.value.delete("Ctrl");
  if (event.key === "Alt") currentKeys.value.delete("Alt");
  if (event.key === "Shift") currentKeys.value.delete("Shift");
  if (event.key === "Meta") currentKeys.value.delete("Meta");

  // 对于普通按键，在释放时结束录制
  if (!modifierKeys.has(event.key)) {
    const shortcut = getCurrentShortcut();
    if (shortcut && isValidShortcut(shortcut)) {
      // 检查是否重复
      if (props.checkDuplicate(shortcut)) {
        ElMessage.warning("该快捷键已被使用，请选择其他快捷键");
        currentKeys.value.clear();
      } else {
        // 延迟结束录制，确保所有按键状态都已更新
        setTimeout(() => {
          isRecording.value = false;
        }, 100);
      }
    }
  }
}

// 获取当前快捷键字符串
function getCurrentShortcut(): string {
  if (currentKeys.value.size === 0) return "";

  const keys = Array.from(currentKeys.value);
  return keys
    .sort((a, b) => {
      // 修饰键排序：Ctrl, Alt, Shift, Meta, 其他键
      const order: Record<string, number> = { Ctrl: 1, Alt: 2, Shift: 3, Meta: 4 };
      return (order[a] || 5) - (order[b] || 5);
    })
    .join("+");
}

// 更新快捷键
function updateShortcut() {
  const shortcut = getCurrentShortcut();
  if (!shortcut) return;

  // 验证快捷键格式
  if (isValidShortcut(shortcut)) {
    // 检查是否重复
    if (props.checkDuplicate(shortcut)) {
      ElMessage.warning("该快捷键已被使用，请选择其他快捷键");
      return;
    }

    emit("update:modelValue", shortcut);
    emit("change", shortcut);
  }
}

// 验证快捷键格式 - 修改为支持3段式快捷键
function isValidShortcut(shortcut: string): boolean {
  const parts = shortcut.split("+");

  // 单个功能键
  if (parts.length === 1 && /^F[1-9][0-2]?$/.test(parts[0])) {
    return true;
  }

  // 支持2段或3段式快捷键：至少一个修饰键 + 一个普通键
  // 例如：Ctrl+A, Shift+Alt+1, Ctrl+Shift+A 等
  const modifierCount = parts.filter((part) => ["Ctrl", "Alt", "Shift", "Meta"].includes(part)).length;

  const normalKeyCount = parts.filter((part) => !["Ctrl", "Alt", "Shift", "Meta"].includes(part)).length;

  // 至少1个修饰键和1个普通键，最多支持3个按键组合
  return modifierCount >= 1 && normalKeyCount >= 1 && parts.length <= 3;
}

// 处理获得焦点
function handleFocus() {
  isRecording.value = true;
  currentKeys.value.clear();
  lastKeyTime.value = Date.now();
}

// 处理失去焦点
function handleBlur() {
  setTimeout(() => {
    isRecording.value = false;
    currentKeys.value.clear();
  }, 200);
}

// 清空快捷键
function handleClear() {
  emit("update:modelValue", "");
  emit("change", "");
}

// 监听 modelValue 变化，同步到外部
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      currentKeys.value.clear();
    }
  }
);
</script>

<style scoped lang="scss">
:deep(.el-input) {
  &.is-recording {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }
}

.recording-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  // background-color: #ff4d4f;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
