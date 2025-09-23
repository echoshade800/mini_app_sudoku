# 数独小游戏

一个基于 React + TypeScript + Vite 构建的数独小游戏。

## 功能特性

- 🎮 经典数独游戏玩法
- 🎯 多种难度选择
- 📱 响应式设计，适配移动端
- ⚡ 基于 Vite 的快速开发体验
- 🎨 使用 Tailwind CSS 构建现代化 UI

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 部署

### 自动部署

```bash
# 构建并部署到 AWS S3
npm run build:deploy
```

### 手动部署

```bash
# 1. 构建项目
npm run build

# 2. 部署到 S3
npm run deploy
```

### 部署配置

部署脚本 (`deploy.cjs`) 会将构建文件上传到 AWS S3 存储桶。请确保：

1. 已安装 AWS SDK: `npm install aws-sdk`
2. 配置了 AWS 凭证（通过环境变量或 AWS CLI）
3. 有权限访问目标 S3 存储桶

### 环境变量

- `NODE_ENV`: 部署环境（默认为 'production'）

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图标**: Lucide React
- **日期处理**: Day.js

## 项目结构

```
src/
├── components/     # React 组件
├── pages/         # 页面组件
├── logic/         # 游戏逻辑
├── store/         # 状态管理
├── types/         # TypeScript 类型定义
└── bridge/        # 桥接模块
```
