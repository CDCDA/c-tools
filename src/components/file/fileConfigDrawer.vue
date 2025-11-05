<template>
  <el-drawer v-model="open" title="文件查询配置" size="400px" :with-header="false" direction="btt" @close="close">
    <div class="drawer-inner">
      <div class="drawer-header">
        <h3>文件配置</h3>
      </div>
      <el-form :model="options" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="最大深度" prop="maxDepth">
          <el-input-number
            v-model="options.maxDepth"
            type="number"
            :min="0"
            :max="100"
            @keyup.enter.native="submit"
            placeholder="请输入最大深度，0表示不限制"
          />
        </el-form-item>
        <el-form-item label="包含文件" prop="includeFiles">
          <el-input
            v-model="options.includeFiles"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            @keyup.enter.native="submit"
            placeholder="请输入包含的文件，逗号分隔"
          />
        </el-form-item>
        <el-form-item label="排除文件" prop="excludeFiles">
          <el-input
            v-model="options.excludeFiles"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            @keyup.enter.native="submit"
            placeholder="请输入排除的文件，逗号分隔"
          />
        </el-form-item>
      </el-form>

      <div class="drawer-footer">
        <el-checkbox v-model="options.refreshImmediately" style="margin-bottom: 5px">修改后立即刷新文件树</el-checkbox>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
const options = ref<any>({});
const rules = ref({
  maxDepth: [{ required: true, message: "请输入最大深度", trigger: ["blur"] }],
  // includeFiles: [{ required: true, message: "请输入包含的文件，逗号分隔", trigger: ["blur"] }],
  // excludeFiles: [{ required: true, message: "请输入排除的文件，逗号分隔", trigger: ["blur"] }],
});

const formRef = ref<any>(null);
const open = ref(false);
const emit = defineEmits(["update:options"]);

function close() {
  open.value = false;
}

function init(params: any) {
  options.value = params;
  open.value = true;
}

function submit() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit("update:options", options.value);
    }
  });
  close();
}

defineExpose({
  init,
});
</script>

<style scoped>
.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  /* padding: 16px 0; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.el-form {
  padding: 10px;
}

.drawer-footer {
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
