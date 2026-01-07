#!/bin/bash

# Cursor MCP 添加脚本
# 用法: ./scripts/add-mcp.sh <mcp-name> <command> <args...>
# 示例: ./scripts/add-mcp.sh playwright npx @playwright/mcp@latest

MCP_NAME=$1
COMMAND=$2
shift 2
ARGS="$@"

MCP_CONFIG_FILE="$HOME/.cursor/mcp.json"

if [ -z "$MCP_NAME" ] || [ -z "$COMMAND" ]; then
    echo "用法: $0 <mcp-name> <command> <args...>"
    echo "示例: $0 playwright npx @playwright/mcp@latest"
    exit 1
fi

# 检查配置文件是否存在
if [ ! -f "$MCP_CONFIG_FILE" ]; then
    echo "创建新的 MCP 配置文件: $MCP_CONFIG_FILE"
    mkdir -p "$HOME/.cursor"
    echo '{"mcpServers": {}}' > "$MCP_CONFIG_FILE"
fi

# 使用 Node.js 来安全地修改 JSON 文件
node -e "
const fs = require('fs');
const path = '$MCP_CONFIG_FILE';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));

// 构建 args 数组
const args = '$ARGS'.split(' ').filter(arg => arg.length > 0);

// 添加或更新 MCP 服务器配置
config.mcpServers['$MCP_NAME'] = {
    command: '$COMMAND',
    args: args.length > 0 ? args : []
};

// 写回文件
fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('✅ 已添加 MCP 服务器: $MCP_NAME');
console.log('   命令: $COMMAND');
console.log('   参数: ${ARGS:-无}');
console.log('');
console.log('⚠️  请重启 Cursor 以使配置生效');
"




