import { invoke } from "@tauri-apps/api/core";

export async function testDbConnection(connectionString: string) {
  return await invoke("test_db_connection", { connectionString });
}

export async function getAllTables(connectionString: string) {
  return await invoke("get_all_tables", { connectionString });
}

export async function getTableColumns(connectionString: string, schema: string, tableName: string) {
  return await invoke("get_table_columns", { connectionString, schema, tableName });
}

const javaTypeMap: { [key: string]: string } = {
  bigint: "Long",
  int: "Integer",
  varchar: "String",
  text: "String",
  datetime: "LocalDateTime",
  timestamp: "LocalDateTime",
  date: "LocalDate",
  time: "LocalTime",
};

const tsTypeMap: { [key: string]: string } = {
  bigint: "number",
  int: "number",
  varchar: "string",
  text: "string",
  datetime: "Date",
  timestamp: "Date",
  date: "Date",
  time: "Date",
};

export function translateDataType(dataType: string, type: string) {
  if (!type || !dataType) return dataType;
  let realType = "";
  const lowerCaseType = dataType.trim().toLowerCase();
  const typeMap = type === "java" ? javaTypeMap : tsTypeMap;
  // 查找包含的关键字
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerCaseType.includes(key)) {
      realType = value;
    }
  }
  // 如果没有匹配的，返回原数据类型
  return realType;
}
