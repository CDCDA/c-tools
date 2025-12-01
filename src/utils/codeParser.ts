// 使用 handlebars 作为模板引擎
import Handlebars from "handlebars";
import { ElNotification } from "element-plus";
export class codeParser {
  static initHelpers() {
    // 注册条件助手
    Handlebars.registerHelper("if", function (this: any, condition, options) {
      return condition ? options.fn(this) : options.inverse(this);
    });

    // 注册列表助手
    Handlebars.registerHelper("list", function (items, options) {
      if (!Array.isArray(items)) return "";
      return items.map((item) => options.fn(item)).join("");
    });

    // 注册相等比较助手
    Handlebars.registerHelper("eq", (a, b) => a === b);
    Handlebars.registerHelper("neq", (a, b) => a !== b);
  }

  static parse(template: string, data: any): string {
    try {
      this.initHelpers();
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error: any) {
      ElNotification.error({
        title: "模板解析错误",
        message: error,
      });
      return "";
    }
  }
}
