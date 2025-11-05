//清理重复国际化
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");

const prePath = "course";
const directory = `src`;

async function processFiles() {
  try {
    const files = glob.sync(`src/**/*.vue`);
    console.log(`找到 ${files.length} 个文件，开始处理...`);

    await Promise.all(files.map((file) => processFile(file)));
    console.log("所有文件处理完成！");
  } catch (error: any) {
    console.error("处理失败：", error);
  }
}
async function processFile(filePath) {
  try {
    let content = await fs.readFile(filePath, "utf-8");
    const original = content;

    // 匹配完整的<template>标签内容（含闭合标签）
    const templateRegex = /<template>([\s\S]*?)<script/;
    const templateMatch = content.match(templateRegex);

    if (templateMatch) {
      // 提取模板内容（含外围标签）
      const fullTemplate = templateMatch[0];
      // 替换所有this.$t为$t
      const cleanedTemplate = fullTemplate.replace(/this\.\$t/g, "$t");

      // 用处理后的内容替换原模板
      content = content.replace(templateRegex, cleanedTemplate);
    }

    if (content !== original) {
      await fs.writeFile(filePath, content);
      console.log(`已更新：${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error: any) {
    console.error(`处理 ${filePath} 失败：`, error);
  }
}

(async () => {
  try {
    await processFiles();
  } catch (err) {
    console.error("未处理的错误：", err);
    process.exit(1);
  }
})();
