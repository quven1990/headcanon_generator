#!/bin/bash

# 设置 PATH 环境变量
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "可以使用以下命令安装："
    echo "  brew install node"
    echo "或者访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 正在安装 pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm 版本: $(pnpm --version)"

# 安装项目依赖
echo "📦 正在安装项目依赖..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功！"
    echo ""
    echo "🚀 运行项目："
    echo "   pnpm dev"
    echo ""
    echo "然后在浏览器中打开 http://localhost:3000"
else
    echo "❌ 依赖安装失败，请检查错误信息"
    exit 1
fi

