#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
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

const LOGIN_TOOL = {
  name: "maps_login",
  description: "登录高德地图，并返回用户的用户名",
  inputSchema: {
    type: "object",
    properties: {
      serverName: {
          type: "string",
          description: "服务器名"
      }
    },
    required: ["serverName"]
  },
};



const MAPS_TOOLS = [
    LOGIN_TOOL
];
async function handleLogin() {
  const url = new URL("http://localhost:3000/api/v1/mcp/login");
  url.searchParams.append("email", LOGIN_PARAMS.email);
  url.searchParams.append("password", LOGIN_PARAMS.password);
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
// Server setup
const server = new Server({
    name: "mcp-server/wleeping-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MAPS_TOOLS,
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "maps_login": {
              return await handleLogin();
            }
            default:
                return {
                    content: [{
                            type: "text",
                            text: `Unknown tool: ${request.params.name}`
                        }],
                    isError: true
                };
        }
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                }],
            isError: true
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("wsleeping MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});