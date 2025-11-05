const fs = require("fs-extra");
const path = require("path");

// 获取obj1比obj2多出的键和obj1中值为空的键
function getUniqueKeys(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  let newObj = {};
  // 找出只存在于 obj1 中的键
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      newObj[key] = obj1[key];
    }
  }
  // 找出只存在于 obj2 中的键
  for (const key of keys2) {
    if (!keys1.includes(key)) {
      newObj[key] = obj2[key];
    }
  }
  // 找出 obj2 中键值为空的键
  for (const key of keys2) {
    if (obj2[key] === "") {
      newObj[key] = obj1[key];
    }
  }
  return newObj;
}

function getUnusedKeys(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  let newObj = {};
  // 找出只存在于 obj1 中的键
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      newObj[key] = obj1[key];
    }
  }
  return newObj;
}

//写入数据
function writeJsonFile(filePath, data) {
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log("文件不存在, 创建文件...");
    const dirPath = path.dirname(filePath);
    // 确保目录存在
    fs.mkdirSync(dirPath, { recursive: true });
    // 创建文件并写入内容，指定字符编码为 utf8
    fs.writeFile(filePath, data, "utf8", (err) => {
      if (err) {
        console.error("写入文件时出错:", err);
      } else {
        console.log("数据已写入:" + filePath);
      }
    });
    return;
  }
  // 写入数据，指定字符编码为 utf8
  fs.writeFile(filePath, data, "utf8", (err) => {
    if (err) {
      console.error("写入文件时出错:", err);
    } else {
      console.log("数据已写入:" + filePath);
    }
  });
}

function getFileJson(filePath) {
  return new Promise((resolve, reject) => {
    // 读取文件
    fs.readFile(path.resolve(__dirname, filePath), "utf8", (err, data) => {
      if (err) {
        // 若读取文件时出错，拒绝 Promise 并返回错误信息
        reject(err);
        return;
      }
      try {
        // 尝试将文件内容解析为 JSON 对象
        const json = JSON.parse(data);

        // 若解析成功，解析后的 JSON 对象会被传递给 Promise 的 resolve 方法
        resolve(json);
      } catch (parseError) {
        // 若解析失败，拒绝 Promise 并返回解析错误信息
        reject(parseError);
      }
    });
  });
}

function getFileData(filePath) {
  return new Promise((resolve, reject) => {
    // 读取文件
    fs.readFile(path.resolve(__dirname, filePath), "utf8", (err, data) => {
      if (err) {
        // 若读取文件时出错，拒绝 Promise 并返回错误信息
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

// export async function getFileJson(path) {
//   try {
//     const module = await import(path); // 等待模块加载
//     return Object.assign({}, module.default); // 返回新对象避免副作用
//   } catch (err) {
//     throw new Error(`加载模块失败: ${err.message}`); // 抛出错误供调用方捕获
//   }
// }

module.exports = {
  getUniqueKeys,
  writeJsonFile,
  getFileJson,
  getFileData,
  getUnusedKeys,
};
