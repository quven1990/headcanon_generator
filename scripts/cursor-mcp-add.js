#!/usr/bin/env node

/**
 * Cursor MCP 添加工具
 * 用法: node scripts/cursor-mcp-add.js <mcp-name> <command> <args...>
 * 示例: node scripts/cursor-mcp-add.js playwright npx @playwright/mcp@latest
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const MCP_CONFIG_FILE = path.join(os.homedir(), '.cursor', 'mcp.json');

function addMCP(mcpName, command, args = []) {
  // 检查配置文件是否存在
  let config = { mcpServers: {} };
  
  if (fs.existsSync(MCP_CONFIG_FILE)) {
    try {
      const content = fs.readFileSync(MCP_CONFIG_FILE, 'utf8');
      config = JSON.parse(content);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch (error) {
      console.error('❌ 读取配置文件失败:', error.message);
      process.exit(1);
    }
  } else {
    // 创建目录和文件
    const configDir = path.dirname(MCP_CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  // 检查是否已存在
  if (config.mcpServers[mcpName]) {
    console.log(`⚠️  MCP 服务器 "${mcpName}" 已存在，将覆盖现有配置`);
  }

  // 添加或更新 MCP 服务器配置
  config.mcpServers[mcpName] = {
    command: command,
    args: Array.isArray(args) ? args : args.split(' ').filter(arg => arg.length > 0)
  };

  // 写回文件
  try {
    fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`✅ 已添加 MCP 服务器: ${mcpName}`);
    console.log(`   命令: ${command}`);
    console.log(`   参数: ${config.mcpServers[mcpName].args.join(' ') || '无'}`);
    console.log('');
    console.log('⚠️  请重启 Cursor 以使配置生效');
  } catch (error) {
    console.error('❌ 写入配置文件失败:', error.message);
    process.exit(1);
  }
}

// 解析命令行参数
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('用法: cursor-mcp-add <mcp-name> <command> [args...]');
  console.log('');
  console.log('示例:');
  console.log('  cursor-mcp-add playwright npx @playwright/mcp@latest');
  console.log('  cursor-mcp-add mysql npx -y @sajithrw/mcp-mysql');
  console.log('');
  process.exit(1);
}

const [mcpName, command, ...mcpArgs] = args;

addMCP(mcpName, command, mcpArgs);




