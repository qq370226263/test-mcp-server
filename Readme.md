# Wsleeping Test MCP Server

wsleeping 个人网站测试mcp服务器

## Setup

### NPX

```json
{
    "mcpServers": {
        "wsleeping-mcp-server": {
            "command": "npx",
            "args": [
                "-y",
                "wsleeping-mcp-server"
            ],
            "env": {
                "WEBSITE_EMAIL": "",
                "WEBSITE_PASSWORD": ""
            }
        }
    }
}
```