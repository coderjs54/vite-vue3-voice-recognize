# VoiceMemo

> 一个基于 Web Speech API 的纯前端语音识别应用，支持实时语音转文字、主题切换等功能。

## 📋 项目概述

VoiceMemo 是一款轻量级的语音识别应用，利用浏览器原生的 Web Speech API 实现离线语音转文字功能。无需后端服务器，数据完全在客户端处理，保护用户隐私。

## ✨ 功能特性

- 🎤 **实时语音识别**：基于 Web Speech API，支持中文普通话实时转换
- 🎙️ **录音功能**：内置录音功能，支持录音状态显示和计时器
- 🌓 **主题切换**：支持亮色/暗色主题切换，自动适配系统偏好
- 📝 **识别结果展示**：实时显示识别结果，支持一键复制和清空
- ⚡ **纯前端实现**：无需后端服务器，数据完全在客户端处理
- 📱 **响应式设计**：适配不同屏幕尺寸，移动端友好

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.5 | 渐进式 JavaScript 框架 |
| TypeScript | ^6.0 | 类型安全的 JavaScript 超集 |
| Vite | ^8.0 | 下一代前端构建工具 |
| SCSS | ^1.87 | CSS 预处理器 |
| Lucide Vue | ^1.20 | 现代化图标库 |
| Vitest | ^4.1 | 快速单元测试框架 |

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:5173/

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

## 📖 使用方法

### 语音识别

1. 点击页面中央的麦克风按钮开始录音
2. 系统会自动识别语音并实时显示识别结果
3. 再次点击麦克风按钮停止录音
4. 在识别结果卡片中可以复制或清空内容

### 主题切换

- 点击顶部导航栏的主题切换按钮（太阳/月亮图标）
- 主题设置会自动保存到本地存储
- 首次访问时会自动检测系统主题偏好

## 📁 项目结构

```
src/
├── components/           # Vue 组件
│   ├── TopBar.vue       # 顶部导航栏
│   ├── RecordingZone.vue # 录音区域
│   └── TranscriptionCard.vue # 识别结果卡片
├── composables/         # 组合式函数
│   ├── useAudioRecorder.ts    # 录音逻辑
│   ├── useSpeechRecognition.ts # 语音识别逻辑
│   └── useTheme.ts            # 主题切换逻辑
├── styles/              # 样式文件
│   └── index.scss       # 全局样式入口
├── types/               # TypeScript 类型定义
│   ├── index.ts         # 通用类型
│   └── web-speech-api.d.ts # Web Speech API 类型
├── utils/               # 工具函数
│   ├── index.ts         # 工具函数
│   └── index.test.ts    # 测试文件
├── App.vue              # 根组件
└── main.ts              # 应用入口
```

## ⚙️ 配置说明

### Vite 配置

`vite.config.ts` 主要配置项：

- `base`: 部署基础路径，默认为 `/vite-vue3-voice-recognize/`
- `resolve.alias`: 路径别名，`@` 指向 `src/` 目录
- `build.rollupOptions.output.manualChunks`: 代码分割配置
- `build.assetsInlineLimit`: 资源内联限制，默认 4096 bytes
- `build.chunkSizeWarningLimit`:  chunk 大小警告限制，默认 1000 kB

### TypeScript 配置

`tsconfig.json` 主要配置项：

- `baseUrl`: 基础路径，用于模块解析
- `paths`: 路径映射，`@/*` 映射到 `src/*`
- `strict`: 开启严格类型检查
- `noUnusedLocals`: 禁止未使用的局部变量
- `noUnusedParameters`: 禁止未使用的函数参数

## 🔧 开发指南

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 规范
- SCSS 使用 kebab-case 命名类名
- 组件使用 PascalCase 命名

### 添加新组件

1. 在 `src/components/` 目录下创建新组件文件
2. 在 `src/styles/index.scss` 中添加组件样式
3. 在 `App.vue` 中导入并使用组件

### 添加新功能

1. 在 `src/composables/` 目录下创建组合式函数
2. 在组件中使用组合式函数
3. 添加相应的样式

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 测试覆盖率

```bash
npm run test:coverage
```

测试结果输出到 `coverage/` 目录

## 🚀 部署

### GitHub Pages

项目已配置 GitHub Actions 自动构建流程。

1. 将代码推送到 GitHub 仓库
2. 启用 GitHub Pages，设置源为 `gh-pages` 分支
3. 每次 push 到 `main` 分支会自动触发构建

### 手动部署

```bash
npm run build
```

将 `dist/` 目录部署到任何静态文件服务器。

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

### 提交规范

使用 Conventional Commits 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📧 联系方式

如有问题或建议，欢迎提交 Issue 或发送邮件。

---

*Built with ❤️ using Vue 3 + Vite*
