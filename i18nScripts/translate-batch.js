//批量翻译并且同时翻译多种语言并写入
const tencentcloud = require("tencentcloud-sdk-nodejs-tmt");
const sourcePath = "../public/locales/zh_cn.json";
let sourceJson = {};
const { getUniqueKeys, getFileJson, writeJsonFile } = require("./utils.js");
const sourceLanguage = "zh";
const targetPaths = [
  // {
  //   path: "../public/locales/zh_hant.json",
  //   targetLanguage: "zh-TW",
  //   name: "繁体中文",
  // },
  {
    path: "../public/locales/en_us.json",
    targetLanguage: "en",
    name: "英语",
  },
  // {
  //   path: "../public/locales/vi.json",
  //   targetLanguage: "vi",
  //   name: "越南语",
  // },
];

const TmtClient = tencentcloud.tmt.v20180321.Client;

const clientConfig = {
  credential: {
    secretId: "AKIDyEJLKcmiRwKYaQ3iDVDi0Ociqpb9g7b9",
    secretKey: "Xr0WqtlPp6A0e4HLBtOgV7XkjU1Wq10m",
  },
  region: "ap-beijing",
  profile: {
    httpProfile: {
      endpoint: "tmt.tencentcloudapi.com",
    },
  },
};

const client = new TmtClient(clientConfig);

// 翻译
async function translate(params, i = 1) {
  try {
    const data = await client.TextTranslateBatch(params);
    return data.TargetTextList;
  } catch (error: any) {
    if (error) {
      console.error("翻译出错:", error);
      console.error(`发起第${i}次重新请求`);
      i++;
      if (i >= 3) {
        return [];
      }
      return await translate(params, i);
    }
  }
}

async function getJson(targetPath, targetLanguage, languageName) {
  const targetJson = await getFileJson(targetPath);
  const content = getUniqueKeys(sourceJson, targetJson);
  //单次请求的最大字符数量
  const maxChars = 2000;
  let currentChars = 0;
  let currentBatch = [];
  let currentKeys = [];
  let allTranslations = {};
  for (const key in content) {
    if (content.hasOwnProperty(key)) {
      const text = content[key];
      // if (!text) return;
      const textLength = text?.length || 0;
      if (currentChars + textLength > maxChars) {
        // 超过 5000 字符，发起请求
        const params = {
          Source: sourceLanguage,
          Target: targetLanguage,
          ProjectId: 0,
          SourceTextList: currentBatch,
        };
        // console.log("翻译参数", params.SourceTextList);
        let translations = await translate(params);
        // console.log("翻译结果", translations);
        // 对越南语翻译结果进行去重
        if (targetLanguage === "vi") {
          translations = deduplicateTranslations(translations);
        }

        if (translations.length > 0) {
          // 将翻译结果与键对应起来
          for (let i = 0; i < currentKeys.length; i++) {
            allTranslations[currentKeys[i]] = translations[i];
          }
        }
        // 重置当前批次
        currentBatch = [];
        currentKeys = [];
        currentChars = 0;
        // 控制请求速率，等待 200ms（保证小于 5 次/s）
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      currentBatch.push(text);
      currentKeys.push(key);
      currentChars += textLength;
    }
  }

  // 处理最后一批
  if (currentBatch.length > 0) {
    const params = {
      Source: sourceLanguage,
      Target: targetLanguage,
      ProjectId: 0,
      SourceTextList: currentBatch,
    };
    if (currentBatch[0] === "") {
      console.log(`[${languageName}]没有新key需要翻译`);
      return;
    }
    let translations = await translate(params);

    if (translations.length > 0) {
      // 将翻译结果与键对应起来
      for (let i = 0; i < currentKeys.length; i++) {
        allTranslations[currentKeys[i]] = translations[i];
      }
    }
  }
  if (allTranslations) {
    let newJson = Object.assign({}, targetJson, allTranslations);
    let length1 = Object.keys(newJson).length;
    // 清理外语文件在中文文件中不存在的key
    newJson = cleanJson(sourceJson, newJson);
    console.log(`中文文件 共 ${Object.keys(sourceJson).length} 个键值对`);
    console.log(`共 ${Object.keys(content).length} 个新键值对翻译完毕`);
    console.log(
      `${languageName} 初始 共 ${Object.keys(targetJson).length} 个键值对`
    );
    console.log(
      `${languageName} 结束 共 ${Object.keys(newJson).length} 个键值对`
    );
    console.log(
      `${languageName} 共 删除 ${length1 - Object.keys(newJson).length
      } 个键值对`
    );
    if (targetLanguage === "vi") {
      console.log("清理越南语重复翻译");
      newJson = deduplicateTranslations(newJson);
    }

    let writeText = `${JSON.stringify(newJson)}`;
    writeJsonFile(targetPath, writeText);
    console.log("<====== 分割线 ======>");
  }
  return allTranslations;
}

function cleanJson(json1, json2) {
  const keys1 = Object.keys(json1);
  const keys2 = Object.keys(json2);
  let newJson = {};
  keys2.forEach((key) => {
    if (keys1.includes(key)) {
      newJson[key] = json2[key];
    }
  });
  return newJson;
}

// 规范化翻译结果，去除重复的部分
function normalizeTranslation(text) {
  if (typeof text !== "string") return text;

  // 按 "/" 分割字符串
  const parts = text
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);

  // 去重
  const uniqueParts = [...new Set(parts)];

  // 拼接回字符串
  return uniqueParts.join(" / ");
}

// 去重函数，针对翻译结果中的重复值
function deduplicateTranslations(json) {
  const deduplicated = {};

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = json[key];

      // 如果值是字符串，进行规范化处理
      if (typeof value === "string") {
        deduplicated[key] = normalizeTranslation(value);
      }
      // 如果值是数组，递归处理数组中的每个元素
      else if (Array.isArray(value)) {
        deduplicated[key] = value.map((item) => {
          if (typeof item === "string") {
            return normalizeTranslation(item);
          }
          return item;
        });
      }
      // 如果值是对象，递归处理对象
      else if (typeof value === "object" && value !== null) {
        deduplicated[key] = deduplicateTranslations(value);
      }
      // 其他情况直接保留
      else {
        deduplicated[key] = value;
      }
    }
  }

  return deduplicated;
}

async function start() {
  // 获取中文源文件json
  sourceJson = await getFileJson(sourcePath);
  // 串行执行所有翻译任务
  for (const item of targetPaths) {
    await getJson(item.path, item.targetLanguage, item.name);
  }
}

start().then((r) => { });
