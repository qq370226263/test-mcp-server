#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";


function getParams() {
  const email = process.env.WEBSITE_EMAIL;
  const password = process.env.WEBSITE_PASSWORD;
  if (!email || !password) {
      console.error("EMAIL or PASSWORD environment variable is not set");
      process.exit(1);
  }
  return {email, password};
}
const LOGIN_PARAMS = getParams();


// 定义工具
const LOGIN_TOOL = {
    name: "login",
    description: "登录",
    inputSchema: {},
};

const VIDEO_SEARCH_TOOL = {
  name: "video_search",
  description: "查询当前用户的视频储存列表",
  inputSchema: {
    type: 'object',
    properties: {
      suffix: {
        types: 'string',
        description: '视频的格式'
      }
    }
  },
};

async function handleVideoList(suffix) {
  const url = new URL("https://www.willianwong.top/api/v1/mcp/video-list");
    url.searchParams.append("suffix", suffix);
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.code === 0) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data.data, null, 2)
        }],
        isError: false
      }
    } else {
      return {
        content: [{
          type: "text",
          text: `登录失败, ${data.message}`
        }],
        isError: true
      }
    }
}

// 处理函数
async function handleLogin(email, password) {
    const url = new URL("https://www.willianwong.top/api/v1/mcp/login");
    url.searchParams.append("email", email);
    url.searchParams.append("password", password);
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.code === 0) {
      return {
        content: [{
          type: "text",
          text: `欢迎回来, ${data.data.username}`
        }],
        isError: false
      }
    } else {
      return {
        content: [{
          type: "text",
          text: `登录失败, ${data.message}`
        }],
        isError: true
      }
    }
}
const server = new Server({
    name: "wsleeping_mcp_service",
    description: "一个wsleeping的存储服务",
    version: "0.0.1"
}, {
  capabilities: {
    tools: {},
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    LOGIN_TOOL,
    VIDEO_SEARCH_TOOL,
  ]
}));

server.setRequestHandler(async (request) => {
    if (request.params.name === 'login') {
        return await handleLogin(LOGIN_PARAMS.email, LOGIN_PARAMS.password);
    }
    if (request.params.name === 'video_search') {
        const {suffix} = request.params.arguments;
        return await handleVideoList(suffix)
    }
    return {
      content: [{
        type: 'text',
        text: `Unkown tool: ${request.params.name}`
      }],
      isError: true
    }
});


async function runServer() {
    // 创建服务器
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("服务器启动成功")
}

// 运行服务器
runServer().catch((error) => {
    console.error('服务器错误:', error);
    process.exit(1);
}); 