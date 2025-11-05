const {
  getUniqueKeys,
  getFileJson,
  writeJsonFile,
  getFileData,
} = require("./utils.js");

// 批量国际化脚本
const fs = require("fs-extra");
const glob = require("glob");

// 标签打印 sidebar.js使用了中文作key,需要特殊处理
const excludePaths = [
  "/locales",
  "src/main.js",
  "src/views/basics/labelModule/shared/mxgraph/Sidebar.js",
];

let json = {};

const delLangMap = new Map();

// 处理 Vue 文件
async function processFile(filePath) {
  let content = await getFileData(filePath);
  const langMap = new Map();
  //this.$t() + x
  content = content.replace(
    /this\.\$t\('([^']*)'\)[\s\t]*\+[\s\t]*([a-zA-Z0-9.()$_\s\t\[\]+]+)([\s\t]*\+)/g,
    (match, i18nText, param, suffix) => {
      let key = `${i18nText}{x}`;
      langMap.set(key, key);
      return `this.$t('${key}',{ x:${param}})${suffix}`;
    }
  );
  // this.$t(abc{x},{x:d}) + this.$t(abc)
  content = content.replace(
    /this\.\$t\(('[^']*',\{[^']*}\))[\s\t]*\+[\s\t]*this\.\$t\('([^']*)'\)/g,
    (match, i18nText1, i18nText2) => {
      if (!(i18nText1.includes("{") && i18nText1.includes("}"))) return match;
      const text = i18nText1.match(/'([^']*)'/);
      if (!(text && text[1])) return match;
      let key = `${text[1] + i18nText2}`;
      i18nText1 = i18nText1.replace(text[1], key);
      langMap.set(key, key);
      return `this.$t(${i18nText1}`;
    }
  );
  content = content.replace(
    /this\.\$t\(('[^']*',\{[^']*})\)[\s\t]*\+[\s\t]*'([\u4e00-\u9fa5"？]+)'/g,
    (match, i18nText1, i18nText2) => {
      if (!(i18nText1.includes("{") && i18nText1.includes("}"))) return match;
      console.log(i18nText1, i18nText2);
      const text = i18nText1.match(/'([^']*)'/);
      if (!(text && text[1])) return match;
      let key = `${text[1] + i18nText2}`;
      i18nText1 = i18nText1.replace(text[1], key);
      langMap.set(key, key);
      return `this.$t(${i18nText1})`;
    }
  );

  //this.$t() + x
  content = content.replace(
    /i18n\.t\('([^']*)'\)[\s\t]*\+[\s\t]*([a-zA-Z0-9.()$_\s\t\[\]+]+)([\s\t]*\+)/g,
    (match, i18nText, param, suffix) => {
      let key = `${i18nText}{x}`;
      langMap.set(key, key);
      return `i18n.t('${key}',{ x:${param}})${suffix}`;
    }
  );
  // this.$t(abc{x},{x:d}) + this.$t(abc)
  content = content.replace(
    /i18n\.t\(('[^']*',\{[^']*}\))[\s\t]*\+[\s\t]*i18n\.t\('([^']*)'\)/g,
    (match, i18nText1, i18nText2) => {
      if (!(i18nText1.includes("{") && i18nText1.includes("}"))) return match;
      const text = i18nText1.match(/'([^']*)'/);
      if (!(text && text[1])) return match;
      let key = `${text[1] + i18nText2}`;
      i18nText1 = i18nText1.replace(text[1], key);
      langMap.set(key, key);
      return `i18n.t(${i18nText1}`;
    }
  );
  await writeJsonFile(filePath, content);
  return langMap;
}

// 主流程
(async () => {
  const allLangMap = new Map();
  json = await getFileJson("../public/locales/zh_cn.json");
  //要国际化的目录
  const vueFiles = glob.sync(`../src/**/*.vue`);
  const jsFiles = glob.sync(`../src/**/*.js`);
  let files = [...vueFiles, ...jsFiles];
  // let files = glob.sync(`src/views/demo/index.vue`);
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
  await fs.ensureDir("../src/locales");
  //生成语言js文件
  const filePath = `./json.json`;
  console.log("旧:", Object.keys(json).length);
  Object.keys(json).forEach((key) => {
    allLangMap.set(key, json[key]);
  });
  console.log("新:", allLangMap.size);
  const langContent = `${JSON.stringify(
    Object.fromEntries(allLangMap),
    null,
    2
  )}`;
  writeJsonFile(filePath, langContent);
  console.log("生成语言文件完成！");
})();

// src/views/sf/actioninfo/index.vue
