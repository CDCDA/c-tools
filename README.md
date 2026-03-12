# 🚀 cTools (多功能桌面工具箱)

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3.x-green?logo=vue.js)](https://vuejs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

一款基于 **Tauri** 和 **Vue 3** 开发的高性能、跨平台桌面辅助工具箱。它集成了开发者常用的各种小工具，旨在提升日常开发与办公效率。

---

## ✨ 核心功能预览

### 🛠 开发者专用

- **代码处理**：代码格式化 (Code Formatter)、JSON 编辑器、SQL日志转换器。
- **代码生成器**：支持基于数据库 Schema 和模板的自动化代码生成方案。（后续方向：选中表后一键生成 AI 提示词）。
- **正则专家**：批量正则表达式测试、匹配与提取工具（如项目国际化脚本）。
- **脚本执行**：内置 Shell 脚本执行能力。

### 📂 文件与数据管理

- **文件树生成**：一键生成项目目录树结构。
- **数据库管理**：内置轻量级数据库查看器，支持多源连接。

### ⚡ 系统与效率

- **备忘录 (Memo)**：支持 Markdown 语法的轻量级记事本，支持侧边栏分类，双击插入，单击复制。
- **翻译插件**：集成自动化翻译接口。
- **全局快捷键**：深度集成系统级快捷键，支持自定义功能触发。

---

## 🛠 技术栈

| 模块            | 技术                               |
| :-------------- | :--------------------------------- |
| **前端框架**    | Vue 3 + Vite                       |
| **后端/桌面端** | Rust + Tauri                       |
| **状态管理**    | Pinia                              |
| **脚本/工具**   | TypeScript + SCSS                  |
| **国际化**      | 自研 i18n 自动化处理脚本 (Node.js) |
| **通信**        | Tauri Command & Event              |

---

---

## 🕰 历史功能精简 (已移除)

基础AI的兴起和功能实用性等方面考虑，移除了一些冗余或已有成熟替代方案的功能：

- **图形与交互模块**：
  - **超级截图/取色器/放大镜**：市面上已有如 Snipaste、PixPin 等极其优秀的工具，cTools 不再重复造轮子。
- **文件管理扩展**：
  - **自动化文件整理**：AI 整理稳定性不足，暂时移除。
  - **文件哈希计算**：使用场景较少，可通过命令行轻松替代。
- **系统监控**：
  - **监控中心 (CPU/内存/磁盘)**：属于冗余应用，系统原生监控或专业工具更为强大。

## 📂 项目结构

```text
├── i18nScripts/          # 国际化自动化脚本 (翻译、清理、转换)
├── src/                  # 前端代码
│   ├── api/              # API 接口定义
│   ├── components/       # 通用业务组件 (AI, Editor, SvgIcon等)
│   ├── directive/        # 自定义指令 (拖拽等)
│   ├── store/            # Pinia 状态管理 (分模块)
│   ├── utils/            # 工具类 (Tauri 窗口、剪贴板、系统执行)
│   ├── views/            # 功能视图
│   │   ├── plugins/      # 插件化功能实现 (核心业务)
│   │   └── manage/       # 设置、账号与管理后台
│   └── windows/          # 多窗口控制逻辑
├── src-tauri/            # Rust 后端
│   ├── src/
│   │   ├── commands/     # 定义暴露给前端的 Rust 接口
│   │   ├── core/         # 核心底层实现 (系统信息、文件IO、数据库)
│   │   └── main.rs       # 应用程序入口
│   └── tauri.conf.json   # Tauri 配置文件
└── vite.config.ts        # Vite 配置
```

## 🚀 快速开始

### 1. 前置环境

请确保你的开发环境已安装：

- [Node.js](https://nodejs.org/) (推荐 v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri 依赖](https://tauri.app/v1/guides/getting-started/prerequisites)

### 2. 安装与运行

```bash
# 安装依赖
npm install

# 启动开发环境
npm run tauri dev

# 构建正式版本
npm run tauri build
```
