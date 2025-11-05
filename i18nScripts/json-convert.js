//json转properties
const { getFileJson, writeJsonFile } = require("./utils.js");

async function convert() {
  const json = await getFileJson("./public/locales/en_us.json");
  let writeText = "";
  Object.keys(json).forEach((key) => {
    writeText = writeText + `${key}=${json[key]}\n`;
  });
  // console.log(writeText);
  writeJsonFile("public/locales/en_us.properties", writeText);
}

convert();
