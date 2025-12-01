/**
 * 将字节数转换为GB单位
 * @param bytes - 字节数
 * @param decimals - 保留小数位数，默认2位
 * @returns 格式化后的GB字符串
 */
export const formatBytesToGB = (bytes: number | null | undefined, decimals: number = 2): string => {
  if (bytes === null || bytes === undefined) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(decimals)} GB`;
};

/**
 * 将字节数转换为人类可读的单位
 * @param bytes - 字节数
 * @param decimals - 保留小数位数
 * @returns 格式化后的存储容量字符串
 */
export const formatBytes = (bytes: number | null | undefined, decimals: number = 2): string => {
  if (bytes === null || bytes === undefined) return "0 B";
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
};

/**
 * 将下划线命名转换为驼峰命名
 * @param str 下划线格式的字符串，如：user_name
 * @param isBigCamel 是否为大驼峰（首字母大写），默认为false（小驼峰）
 * @returns 驼峰格式的字符串，如：userName 或 UserName
 */
export function toCamelCase(str: string, isBigCamel: boolean = false): string {
  if (!str || typeof str !== "string") return str;

  return str
    .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^[a-z]/, (firstLetter: string) => (isBigCamel ? firstLetter.toUpperCase() : firstLetter));
}

/**
 * 将下划线命名转换为短横线命名
 * @param str 下划线格式的字符串，如：user_name
 * @returns 短横线格式的字符串，如：user-name
 */
export function toKebabCase(str: string): string {
  if (!str || typeof str !== "string") return str;

  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
