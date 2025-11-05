// 清理未使用key
const fs = require("fs-extra");
const { glob } = require("glob");
// 标签打印 sidebar.js使用了中文作key,需要特殊处理
const excludePaths = [
  "/locales",
  // "src/main.js",
  // "src/views/basics/labelModule/shared/mxgraph/Sidebar.js",
  // "src/api",
  // "src/assets",
  // "src/directive",
  // "src/filter",
  // "src/router",
  // "src/store",
  // "src/utils",
  // "src/permission.js",
  // "src/public-path.js",
  // "src/settings.js",
  ".min.js",
];
const { writeJsonFile, getFileJson, getUnusedKeys } = require("./utils.js");
let json = {};

// 处理 Vue 文件
async function processFile(filePath) {
  let content = await fs.readFile(filePath, "utf-8");
  const langMap = new Map();
  content = content.replace(/\$t\('([^']*)'(\)|[,{])/g, (match, key) => {
    langMap.set(key, key);
    return match;
  });
  content = content.replace(/\$t\("([^"]*)"(\)|[,{])/g, (match, key) => {
    langMap.set(key, key);
    return match;
  });
  content = content.replace(/i18n.t\('([^']*)'(\)|[,{])/g, (match, key) => {
    langMap.set(key, key);
    return match;
  });
  content = content.replace(/i18n.t\("([^"]*)"(\)|[,{])/g, (match, key) => {
    langMap.set(key, key);
    return match;
  });
  // console.log(langMap);
  return langMap;
}

// 主流程
async function main() {
  json = await getFileJson("../public/locales/zh_cn.json");
  const allLangMap = new Map();
  //要国际化的目录
  const vueFiles = glob.sync(`../src/**/*.vue`);
  const jsFiles = glob.sync(`../src/**/*.js`);
  let files = [...vueFiles, ...jsFiles];
  // let files = glob.sync(`src/views/system/dict/data.vue`);
  //遍历vue,js文件
  files = files.filter((x) => {
    return !excludePaths.find((y) => {
      return x.includes(y);
    });
  });
  for (const file of files) {
    try {
      const langMap = await processFile(file);
      langMap.forEach((v, k) => allLangMap.set(k, v));
    } catch (e) {
      console.error(`处理失败: ${file}`, e);
    }
  }
  console.log(`共${files.length}个文件处理完成`);
  let usedJson = {};
  for (const [key, value] of allLangMap) {
    usedJson[key] = value;
  }
  console.log(Object.keys(usedJson).length);
  // 补漏
  const newJson = { ...json, ...usedJson };
  writeJsonFile("../public/locales/zh_cn.json", JSON.stringify(usedJson));
  const unusedJson = getUnusedKeys(newJson, usedJson);
  writeJsonFile("./unused.json", JSON.stringify(unusedJson));
  console.log("生成未使用语言文件完成！");
}

main();
