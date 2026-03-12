<template>
  <div class="page-main sql">
    <div class="sql-input-wrap">
      <el-input v-model="inputSql" class="sql-input" type="textarea" clearable> </el-input>
    </div>
    <div class="sql-tools">
      <el-dropdown class="label-value-item" placement="top" trigger="click">
        <el-button type="text" size="mini" class="language-button" style="margin-right: 12px;">
          {{ currentLanguage.label }}
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="lang in languageList" :disabled="lang.value === currentLanguage.value"
              :key="lang.value" @click="changeLanguage(lang)">
              {{ lang.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-tooltip class="item" effect="dark" content="自动粘贴">
        <svg-icon iconName="otherSvg-粘贴" :class="options.autoPaste ? 'is-active' : ''" class="tool-item svg-btn"
          @click="options.autoPaste = !options.autoPaste" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="开始转化">
        <svg-icon iconName="otherSvg-启动" class="tool-item svg-btn" @click="parseLogToSQL" />
      </el-tooltip>

    </div>
    <div class="sql-output-wrap">
      <Editor class="sql-output" ref="sqlOutputRef" v-model="outputSql" language="sql" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Editor from "@/components/editor/index.vue";
import { format } from "sql-formatter";
import { ElNotification } from "element-plus";
const options = ref({
  language: "sql",
  autoPaste: true,
}) as any;
const inputSql = ref("");
const outputSql = ref("");
const sqlOutputRef = ref(null) as any;

const languageList = [
  { label: "Standard SQL", value: "sql" },
  { label: "MySQL", value: "mysql" },
  { label: "MariaDB", value: "mariadb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "DB2", value: "db2" },
  { label: "PL/SQL", value: "plsql" },
];
const currentLanguage = ref({ label: "MySQL", value: "mysql" });
function changeLanguage(lang: any) {
  currentLanguage.value = lang;
}
async function parseLogToSQL() {
  // 提取SQL语句和参数行
  const lines = inputSql.value.split("\n");
  const sqlLine = lines.find((line) => line.includes("Preparing:")) as any;
  const paramsLine = lines.find((line) => line.includes("Parameters:")) as any;

  if (!sqlLine || !paramsLine) {
    ElNotification.error("无效日志sql");
  }

  // 提取原始SQL（移除前缀）
  const sqlPrefix = "Preparing:";
  const sqlStart = sqlLine.indexOf(sqlPrefix) + sqlPrefix.length;
  let sql = sqlLine.substring(sqlStart).trim();

  // 提取参数（移除前缀）
  const paramsPrefix = "Parameters:";
  const paramsStart = paramsLine.indexOf(paramsPrefix) + paramsPrefix.length;
  const paramsStr = paramsLine.substring(paramsStart).trim();

  // 解析参数列表
  const params = [];
  let buffer = "";
  let inParentheses = false;

  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];

    if (char === "(") {
      inParentheses = true;
    } else if (char === ")") {
      inParentheses = false;
    }

    if (char === "," && !inParentheses) {
      params.push(buffer.trim());
      buffer = "";
    } else {
      buffer += char;
    }
  }
  if (buffer) params.push(buffer.trim());

  // 替换SQL中的占位符
  let paramIndex = 0;
  let resultSQL = "";
  let inStringLiteral = false;
  let escapeNext = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    // 处理转义字符
    if (escapeNext) {
      resultSQL += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      resultSQL += char;
      continue;
    }

    // 处理字符串字面量
    if (char === "'" && !escapeNext) {
      inStringLiteral = !inStringLiteral;
      resultSQL += char;
      continue;
    }

    // 替换问号占位符
    if (char === "?" && !inStringLiteral) {
      if (paramIndex >= params.length) {
        throw new Error(`Not enough parameters for placeholders`);
      }

      const param = params[paramIndex++];
      const typeStart = param.lastIndexOf("(");

      // 提取值和类型
      let value, type;
      if (typeStart !== -1 && param.endsWith(")")) {
        value = param.substring(0, typeStart).trim();
        type = param.substring(typeStart + 1, param.length - 1).trim();
      } else {
        value = param;
        type = "String"; // 默认类型
      }

      // 根据类型格式化值
      if (type.toLowerCase().includes("string")) {
        resultSQL += `'${value.replace(/'/g, "''")}'`; // 转义单引号
      } else if (type.toLowerCase().includes("date") || type.toLowerCase().includes("time")) {
        resultSQL += `'${value}'`; // 日期/时间类型
      } else {
        resultSQL += value; // 数字/布尔等类型
      }
    } else {
      resultSQL += char;
    }
  }

  // 检查未使用的参数
  if (paramIndex < params.length) {
    console.warn(`Warning: ${params.length - paramIndex} unused parameters`);
  }
  try {
    outputSql.value = await format(resultSQL, {
      language: options.value.language,
      indent: "    ", // 4空格缩进
      uppercase: true, // 关键字大写
    } as any);
    // sqlOutputRef.value?.setValue(outputSql.value);
    options.value.autoPaste ? copyResult() : "";
  } catch (err: any) {
    outputSql.value = "SQL格式化错误: " + err.message;
    ElNotification.error(outputSql.value);
  }
}

const copyResult = async () => {
  if (!outputSql.value) return;
  try {
    await navigator.clipboard.writeText(outputSql.value);
    ElNotification.success({
      title: "成功",
      message: "已复制到剪贴板!",
    });
  } catch (err: any) {
    ElNotification.error({
      title: "错误",
      message: "复制失败: " + err.message,
    });
  }
};
</script>

<style lang="scss">
.sql-input {
  &:hover {
    border: none;
    outline: none;
  }

  .el-textarea__inner {
    border: none;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);

    min-height: 150px !important;
  }

  margin-bottom: 10px;
}

.sql-output-wrap {
  margin-top: 10px;
  flex: 1;
  min-height: 0;
}

.sql-tools {
  display: flex;
  align-items: center;
  justify-content: end;


}

.sql-output {
  border-radius: 4px;
  //padding: 10px;
  //box-shadow: 0 0 0 1px #dcdfe6 inset;
}
</style>
