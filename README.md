# Headcanon Generator App

这是一个基于 Next.js 的 Headcanon 生成器应用。

## 前置要求

- Node.js 18+ 
- pnpm（推荐）或 npm

## 安装步骤

### 1. 安装 Node.js（如果未安装）

在 macOS 上，推荐使用 Homebrew 安装：

```bash
brew install node
```

或者从 [Node.js 官网](https://nodejs.org/) 下载安装。

### 2. 安装 pnpm（推荐）

项目使用 pnpm 作为包管理器，推荐安装 pnpm：

```bash
npm install -g pnpm
```

或者使用 Homebrew：

```bash
brew install pnpm
```

### 3. 安装项目依赖

```bash
pnpm install
```

如果使用 npm：

```bash
npm install
```

## 运行项目

### 开发模式

```bash
pnpm dev
```

或使用 npm：

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

- `app/` - Next.js App Router 页面和 API 路由
- `components/` - React 组件
- `lib/` - 工具函数
- `public/` - 静态资源

## 环境变量配置

项目使用 SiliconFlow API 来生成 headcanon。需要创建 `.env.local` 文件并配置 API key：

```bash
# 创建环境变量文件
touch .env.local
```

在 `.env.local` 文件中添加：

```
SILICONFLOW_API_KEY=your_siliconflow_api_key_here
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
```

**注意：** 如果不配置环境变量，代码中已包含默认的 API key 和模型，可以直接使用。但建议将 API key 配置在环境变量中以确保安全。

如果没有 SiliconFlow API key，可以：
1. 访问 [SiliconFlow](https://siliconflow.cn/) 注册账号
2. 在控制台获取 API key
3. 将 key 添加到 `.env.local` 文件中

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI 组件库
- SiliconFlow API (DeepSeek-R1 模型)

