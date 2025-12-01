/*
 * @Description:数据库连接数据
 */

import { defineStore } from "pinia";
import { getData } from "@/utils/dataSave.ts";
import { ref } from "vue";
import { getStoreData, saveStoreData } from "@/utils/localSave.ts";
const useDatabaseStore = defineStore(
  "database",
  () => {
    const databaseList = ref([
      {
        host: "localhost",
        port: 3306,
        url: "jdbc:mysql://localhost:3306/test",
        name: "MySQL",
      },
    ]);
    const defaultDatabase = ref({
      host: "localhost",
      port: 3306,
      url: "jdbc:mysql://localhost:3306/test",
      name: "MySQL",
    });
    const setDefaultDatabase = (database: any) => {
      defaultDatabase.value = database;
    };
    const getDefaultDatabase = () => {
      return defaultDatabase.value;
    };
    const getDatabaseList = () => {
      return databaseList.value;
    };
    const addDatabase = (database: any) => {
      database.id = Date.now();
      databaseList.value.push(database);
    };
    const removeDatabase = (database: any) => {
      databaseList.value = databaseList.value.filter((item: any) => item.id !== database.id);
    };
    const updateDatabase = (database: any) => {
      const index = databaseList.value.findIndex((item: any) => item.id === database.id);
      if (index !== -1) {
        databaseList.value[index] = database;
      }
    };

    const init = async () => {
      const list = await getData("database", "databaseList");
      if (list) {
        databaseList.value = list;
      }
      return list;
    };
    const saveStore = () => {
      saveStoreData("database", {
        databaseList: databaseList.value,
        defaultDatabase: defaultDatabase.value,
      });
    };
    const loadStore = async () => {
      const data = (await getStoreData("database")) as any;
      if (data) {
        databaseList.value = data.databaseList;
        defaultDatabase.value = data.defaultDatabase;
      }
    };
    return {
      databaseList,
      defaultDatabase,
      setDefaultDatabase,
      getDefaultDatabase,
      getDatabaseList,
      addDatabase,
      removeDatabase,
      updateDatabase,
      init,
      saveStore,
      loadStore,
    };
  },
  {
    persist: true, // 开启持久化
  }
);

export { useDatabaseStore };
