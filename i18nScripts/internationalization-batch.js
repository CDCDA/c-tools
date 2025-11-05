// 批量国际化脚本
const fs = require("fs-extra");
const { glob } = require("glob");
// 标签打印 sidebar.js使用了中文作key,需要特殊处理
const excludePaths = [
  "/locales",
  "src/main.js",
  "src/views/basics/labelModule/shared/mxgraph/Sidebar.js",
  "src/api",
  "src/assets",
  "src/directive",
  "src/filter",
  // "src/router",
  "src/store",
  // "src/utils",
  "src/permission.js",
  "src/public-path.js",
  "src/settings.js",
  ".min.js",
];
const { writeJsonFile, getFileJson } = require("./utils.js");
let json = {};

//生成唯一key
function generateKey(text) {
  return text;
}

// 处理 Vue 文件
async function processFile(filePath) {
  let content = await fs.readFile(filePath, "utf-8");
  const langMap = new Map();
  const type = filePath.includes(".js") ? "js" : "vue";
  if (type === "vue") {
    // ================ 处理HTML部分 ================
    content = content.replace(/<template>([\s\S]*)<script/g, (match, text) => {
      text = text.replace(
        /(?<!t\([\s\n]*)(['"])([\u4e00-\u9fa5]+[a-zA-Z0-9\s-,，.“”、（）【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[”】\s]+[\u4e00-\u9fa5]+[\s!？?。！：:]+)\1/g,
        (match, quote, text) => {
          if (match.includes(":'") || match.includes(": '")) {
            console.log(text);
            text = content.replace(
              /'([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，.“”、【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[”】\s]+[\u4e00-\u9fa5]+[\s!？?。！：:]+)'/g,
              (match, newText) => {
                return newText;
              }
            );
            const key = generateKey(text);
            langMap.set(key, text);
            return `${type === "js" ? "i18n.t" : "$t"}('${key}')`;
          }
          return match;
        }
      );
      return `<template>${text}<script`;
    });
    // 1.处理属性中的中文
    content = content.replace(
      /(?<!:)(alt|filter-placeholder|label|prop|placeholder|title|header|footer|description|content|range-separator|end-placeholder|start-placeholder|name|active-text|inactive-text|element-loading-text)=["']([^"']*[\u4e00-\u9fa5][^"']*|[\u4e00-\u9fa5*]+[a-zA-Z0-9\s,，“”、":：（）()【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:（）()]*]+[\u4e00-\u9fa5]+)["']/g,
      (match, attr, text) => {
        const key = generateKey(text);
        langMap.set(key, text);
        return `:${attr}="$t('${key}')"`; // 转换为动态绑定
      }
    );
    content = content.replace(
      /(>[ \t\n\r]*)([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、":：（）()/【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:（）()]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+)([ \t\n\r]*<)/g,
      (match, prefix, text, suffix) => {
        if (
          match.includes("<!") ||
          match.includes("->") ||
          match.includes("/*") ||
          match.includes("*/") ||
          match.includes("//")
        )
          return match;
        const key = generateKey(text.trim());
        langMap.set(key, text.trim());
        return `${prefix}{{ $t('${key}') }}${suffix}`;
      }
    );
  }

  // ================ 处理脚本部分 ================
  // 1. "xxx"或'xxx'
  content = content.replace(
    /(?<!t\([\s\n]*)(['"])([\u4e00-\u9fa5]+[a-zA-Z0-9\s-,，.“”、（）</>()%℃、【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[”】\s]+[\u4e00-\u9fa5]+[\s!？?。！：:]+)\1/g,
    (match, quote, text) => {
      if (
        match.includes("<!") ||
        match.includes("->") ||
        match.includes("/*") ||
        match.includes("*/") ||
        match.includes("//")
      )
        return match;
      if (match.includes(":'") || match.includes(": '")) {
        console.log(text);
        text = content.replace(
          /'([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，.“”、【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[”】\s]+[\u4e00-\u9fa5]+[\s!？?。！：:]+)'/g,
          (match, newText) => {
            return newText;
          }
        );
      }
      const key = generateKey(text);
      langMap.set(key, text);
      if (text.includes("<br/>")) {
        return `${type === "js" ? "i18n.t" : "this.$t"}('${key.replace(
          "<br/>",
          ""
        )}') + <br/>`;
      }
      return `${type === "js" ? "i18n.t" : "this.$t"}('${key}')`;
    }
  );

  content = content.replace(
    /(?<!t\([\s\n]*)'([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，.“”、【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:"]*|[a-zA-Z0-9”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[”】\s]+[\u4e00-\u9fa5]+[\s!？?。！：:]+)'/g,
    (match, text) => {
      if (
        match.includes("<!") ||
        match.includes("->") ||
        match.includes("/*") ||
        match.includes("*/") ||
        match.includes("//")
      )
        return match;
      const key = generateKey(text);
      langMap.set(key, text);
      return `${type === "js" ? "i18n.t" : "this.$t"}('${key}')`;
    }
  );
  // 处理模板字符串 开始
  // 3. `xxx${aaa}bbb`
  content = content.replace(
    /`([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、"_【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+_|[a-zA-Z0-9]+[\u4e00-\u9fa5]+_)\$/g,
    (match, text) => {
      let key = generateKey(text);
      let isInclude = false;
      if (key.includes("_")) {
        key = key.replace("_", "");
        isInclude = true;
      }
      langMap.set(key, text);
      return (
        "`${" +
        `${type === "js" ? "i18n.t" : "this.$t"}('${key}')}${isInclude ? "_" : ""
        }$`
      );
    }
  );
  // 4. `${aaa}xxx${bbb}`
  content = content.replace(
    /}([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、"_【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+)\$/g,
    (match, text) => {
      const key = generateKey(text);
      langMap.set(key, text);
      return "}${" + `${type === "js" ? "i18n.t" : "this.$t"}('${key}')}$`;
    }
  );
  // 5. `${aaa}xxx`
  content = content.replace(
    /}([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、"_【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+)`/g,
    (match, text) => {
      const key = generateKey(text);
      langMap.set(key, text);
      return "}${" + `${type === "js" ? "i18n.t" : "this.$t"}('${key}')}` + "`";
    }
  );
  // 5. `xxx.xlsx`
  content = content.replace(
    /`([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、"_【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+).xlsx`/g,
    (match, text) => {
      const key = generateKey(text);
      langMap.set(key, text);
      return (
        "`${" + `${type === "js" ? "i18n.t" : "this.$t"}('${key}')}` + ".xlsx`"
      );
    }
  );
  //  6. `xxx`
  content = content.replace(
    /\(`([\u4e00-\u9fa5]+[a-zA-Z0-9\s,，“”、"_【\u4e00-\u9fa5]*[\u4e00-\u9fa5]*[\s!？?。！：:]*|[a-zA-Z0-9"”】\s]+[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+[a-zA-Z0-9]+|[\u4e00-\u9fa5]+|[\u4e00-\u9fa5]+_)`\)/g,
    (match, text) => {
      if (match.includes("$t")) return match;
      let key = generateKey(text);
      let isInclude = false;
      if (key.includes("_")) {
        key = key.replace("_", "");
        isInclude = true;
      }
      langMap.set(key, text);
      return "(`${" +
        `${type === "js" ? "i18n.t" : "this.$t"}('${key}')}` +
        isInclude
        ? "_"
        : "" + "`)";
    }
  );
  //处理模板字符串 结束
  // 区分使用i18n.t或者this.$t
  if (type === "js") {
    if (!content.includes("import i18n"))
      content = `import i18n from "~/locales/i18n";\n${content}`;
  }
  await fs.writeFile(filePath, content);
  return langMap;
}

// 主流程
(async () => {
  json = await getFileJson("../public/locales/zh_cn.json");
  const allLangMap = new Map();
  //要国际化的目录
  // const vueFiles = glob.sync(`../src/**/*.vue`);
  // const jsFiles = glob.sync(`../src/**/*.js`);
  // let files = [...vueFiles, ...jsFiles];

  let files = glob.sync(`../src/views/produce/pack/packsninfo.Comment.js`);
  console.log("B", files);
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
  const filePath = `../public/locales/zh_cn.json`;
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

// src\views\produce\pack\packsninfo.Comment.js
