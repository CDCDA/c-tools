<template>
  <el-input ref="inputRef" :model-value="displayValue" :placeholder="isRecording ? '正在录制...按下组合键' : placeholder"
    readonly :class="{ 'is-recording': isRecording }" @keydown="handleKeyDown" @keyup="handleKeyUp"
    @click="startRecording" @blur="handleBlur">
    <template #prefix>
      <div v-if="isRecording" class="recording-dot"></div>
    </template>
    <template #suffix>
      <el-button v-if="modelValue && !isRecording" link @click.stop="handleClear">
        <el-icon>
          <Close />
        </el-icon>
      </el-button>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElNotification } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { useShortcutStore } from "@/store/modules/shortcut.ts";

interface Props {
  modelValue?: string;
  placeholder?: string;
  excludeId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "点击录制快捷键",
  excludeId: "",
});

const emit = defineEmits(["update:modelValue", "change"]);
const shortcutStore = useShortcutStore();
const inputRef = ref();
const isRecording = ref(false);

// 临时记录当前按下的修饰键
const modifiers = ref({
  Ctrl: false,
  Alt: false,
  Shift: false,
  Meta: false,
});

// 计算显示值：录制中显示实时组合，非录制显示已保存值
const displayValue = computed(() => {
  if (!isRecording.value) return props.modelValue;

  const parts = [];
  if (modifiers.value.Ctrl) parts.push("Ctrl");
  if (modifiers.value.Alt) parts.push("Alt");
  if (modifiers.value.Shift) parts.push("Shift");
  if (modifiers.value.Meta) parts.push("Meta");
  return parts.join("+") + (parts.length > 0 ? "+" : "");
});

// 修饰键定义
const modifierKeysMap: Record<string, keyof typeof modifiers.value> = {
  Control: "Ctrl",
  Alt: "Alt",
  Shift: "Shift",
  Meta: "Meta",
};

// 功能键映射
const specialKeyMap: Record<string, string> = {
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Escape: "Esc",
  Enter: "Enter",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Del",
};

function startRecording() {
  isRecording.value = true;
  shortcutStore.unRegisterAll(); // 录制时禁用全局快捷键
  resetModifiers();
}

function resetModifiers() {
  modifiers.value = { Ctrl: false, Alt: false, Shift: false, Meta: false };
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isRecording.value) return;

  event.preventDefault();
  event.stopPropagation();

  const key = event.key;

  // 1. 处理修饰键更新状态
  if (modifierKeysMap[key]) {
    modifiers.value[modifierKeysMap[key]] = true;
    return;
  }

  // 2. 如果按下的是普通键（非修饰键）
  const finalKey = specialKeyMap[key] || (key.length === 1 ? key.toUpperCase() : key);

  // 生成最终快捷键字符串
  const result = composeShortcut(finalKey);

  if (validate(result)) {
    submitShortcut(result);
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (!isRecording.value) return;

  // 如果松开了修饰键，同步更新状态
  const mod = modifierKeysMap[event.key];
  if (mod) {
    modifiers.value[mod] = false;
  }
}

function composeShortcut(finalKey: string): string {
  const parts = [];
  if (modifiers.value.Ctrl || (event as any).ctrlKey) parts.push("Ctrl");
  if (modifiers.value.Alt || (event as any).altKey) parts.push("Alt");
  if (modifiers.value.Shift || (event as any).shiftKey) parts.push("Shift");
  if (modifiers.value.Meta || (event as any).metaKey) parts.push("Meta");

  // 过滤重复并加入普通键
  if (!parts.includes(finalKey)) {
    parts.push(finalKey);
  }
  return parts.join("+");
}

function validate(shortcut: string) {
  const parts = shortcut.split("+");

  // 必须包含至少一个非修饰键
  const hasNormalKey = parts.some(p => !["Ctrl", "Alt", "Shift", "Meta"].includes(p));
  // 必须包含至少一个修饰键 (除非是 F1-F12)
  const hasModifier = parts.some(p => ["Ctrl", "Alt", "Shift", "Meta"].includes(p));
  const isFunctionKey = /^F[1-9][0-2]?$/.test(parts[parts.length - 1]);

  if (!hasNormalKey) return false;
  if (!hasModifier && !isFunctionKey) return false;

  return true;
}

function submitShortcut(shortcut: string) {
  // 校验查重
  const check = shortcutStore.checkShortcutDuplicate(shortcut, props.excludeId);
  if (check.isDuplicate) {
    ElNotification.warning({
      title: "快捷键冲突",
      message: `与功能【${check.duplicateItem?.label}】重复`,
      position: "bottom-right",
    });
    return;
  }

  emit("update:modelValue", shortcut);
  emit("change", shortcut);
  stopRecording();
}

function stopRecording() {
  isRecording.value = false;
  resetModifiers();
  console.log("stopRecording", shortcutStore.shortcuts);
  shortcutStore.registerAll(); // 恢复全局快捷键
  inputRef.value?.blur();
}

function handleBlur() {
  // 延迟关闭，防止点击清除按钮时触发
  setTimeout(() => {
    if (isRecording.value) {
      stopRecording();
    }
  }, 150);
}

function handleClear() {
  emit("update:modelValue", "");
  emit("change", "");
}
</script>

<style scoped lang="scss">
.is-recording {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
    background-color: var(--el-color-primary-light-9);
  }
}

.recording-dot {
  width: 8px;
  height: 8px;
  background-color: var(--el-color-danger);
  border-radius: 50%;
  margin-right: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>