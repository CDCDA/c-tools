<template>
  <el-drawer v-model="open" title="数据库" size="50%" direction="rtl" @close="close">
    <div class="drawer-content">
      <el-form :model="database" ref="databaseForm" label-width="95px" :rules="rules">
        <el-form-item label="连接名称" prop="title">
          <el-input v-model="database.name" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="数据库类型" prop="type">
          <el-radio-group v-model="database.type" size="small">
            <el-radio label="mysql">MySQL</el-radio>
            <el-radio label="postgresql">PostgreSQL</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="连接方式" prop="url">
          <el-radio-group v-model="database.connectType" size="small">
            <el-radio label="host">主机</el-radio>
            <el-radio label="url">url</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主机" prop="host" v-if="database.connectType === 'host'">
          <el-input v-model="database.host" placeholder="请输入数据库主机" />
        </el-form-item>
        <el-form-item label="端口" prop="port" v-if="database.connectType === 'host'">
          <el-input v-model="database.port" placeholder="请输入数据库端口" />
        </el-form-item>
        <el-form-item label="数据库名称" prop="database" v-if="database.connectType === 'host'">
          <el-input v-model="database.database" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="用户名" prop="username" v-if="database.connectType === 'host'">
          <el-input v-model="database.username" placeholder="请输入数据库用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="database.connectType === 'host'">
          <el-input v-model="database.password" placeholder="请输入数据库密码" />
        </el-form-item>
        <el-form-item label="连接URL" prop="realUrl" :readonly="database.connectType === 'host'">
          <el-input v-model="realUrl" placeholder="请输入数据库连接URL" />
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <div class="drawer-footer-left">
        <el-button type="text" size="mini" @click="handleTestConnection">测试连接</el-button>
      </div>
      <div class="drawer-footer-right">
        <el-button type="primary" @click="handleSubmit">确定</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, computed, reactive } from "vue";
import { useDatabaseStore } from "@/store/modules/database.ts";
import { testDbConnection } from "@/utils/db.ts";
import { saveData } from "@/utils/dataSave.ts";
const databaseStore = useDatabaseStore();
const open = ref(false);
const emit = defineEmits(["update:database"]);
const rules = reactive({
  title: [{ required: true, message: "请输入连接名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择数据库类型", trigger: "change" }],
  connectType: [{ required: true, message: "请选择连接方式", trigger: "change" }],
  host: [{ required: true, message: "请输入数据库主机", trigger: "blur" }],
  port: [{ required: true, message: "请输入数据库端口", trigger: "blur" }],
  database: [{ required: true, message: "请输入数据库名称", trigger: "blur" }],
  username: [{ required: true, message: "请输入数据库用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入数据库密码", trigger: "blur" }],
  url: [{ required: true, message: "请输入数据库连接URL", trigger: "blur" }],
});
const realUrl = computed(() => {
  if (database.value.connectType === "host") {
    return `${database.value.type}://${database.value.username}:${database.value.password}@${database.value.host}:${database.value.port}/${database.value.database}`;
  }
  return database.value.url;
});

const close = () => {
  open.value = false;
};

const action = ref("add") as any;

const init = (params: any) => {
  database.value = params.database;
  action.value = params.action;
  open.value = true;
};

const database = ref([]) as any;

async function handleTestConnection() {
  try {
    const result = await testDbConnection(realUrl.value);
    if (result) {
      ElNotification.success("连接成功");
    }
  } catch (error: any) {
    ElNotification.error("连接失败:", error.message);
  }
}
const databaseForm = ref(null) as any;
function handleSubmit() {
  database.value.url = realUrl.value;
  databaseForm.value.validate(async (valid: boolean) => {
    if (valid) {
      if (action.value === "add") {
        databaseStore.addDatabase(database.value);
      } else {
        databaseStore.updateDatabase(database.value);
      }

      saveData("database", "databaseList", databaseStore.databaseList);
      close();
    }
  });
}
defineExpose({
  init,
});
</script>

<style scoped lang="scss">
.drawer-content {
  .tools {
    margin-bottom: 10px;
  }
}
.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
