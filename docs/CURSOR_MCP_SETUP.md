# Cursor MCP Server Setup

## 🛡️ CV Builder Safety-First Development Workflow MCP Server

This MCP server provides safety-first development guidelines and workflow management for the CV Builder project.

## 📋 Setup Instructions

### 1. Install MCP SDK Dependencies
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Add to Cursor Settings

#### Option A: Global Cursor Settings
Add this to your Cursor settings (Cmd/Ctrl + , → Extensions → MCP):

```json
{
  "mcpServers": {
    "cv-builder-workflow": {
      "command": "node",
      "args": ["/Users/jared/Development/pn/cv-builder/.cursor/mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### Option B: Workspace Settings
Create `.vscode/settings.json` in your project root:

```json
{
  "mcp.servers": {
    "cv-builder-workflow": {
      "command": "node",
      "args": ["/Users/jared/Development/pn/cv-builder/.cursor/mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 3. Restart Cursor
After adding the MCP server configuration, restart Cursor to load the new server.

## 🔧 Available Tools

The MCP server provides these tools:

### `get_workflow_guidelines`
Get the complete safety-first development workflow guidelines.

### `check_safety_rules`
Check if a proposed action follows safety rules.
- **Input**: `action` (string) - The action being proposed
- **Input**: `context` (string, optional) - Context about the action

### `get_database_protection_status`
Get current database protection status and active safety rules.

### `validate_production_action`
Validate if a production action is safe to proceed.
- **Input**: `action` (string) - The production action being considered
- **Input**: `hasPassword` (boolean) - Whether production password is available
- **Input**: `hasConfirmation` (boolean) - Whether explicit confirmation has been given

## 🛡️ Safety Features

### Automatic Safety Checks
- Validates actions against safety rules
- Blocks dangerous production actions
- Requires explicit confirmation for production changes
- Enforces password protection for production migrations

### Workflow Management
- Provides complete development workflow guidelines
- Checks database protection status
- Validates production actions before execution
- Maintains safety-first development principles

## 🚀 Usage

Once configured, the MCP server will:
1. **Automatically validate** all proposed actions
2. **Block dangerous operations** that could affect production
3. **Require explicit confirmation** for any production changes
4. **Provide safety guidelines** when needed

## 🔍 Testing the MCP Server

You can test the MCP server by running:
```bash
node .cursor/mcp-server.js
```

The server should start and be ready to handle MCP requests from Cursor.

## 📞 Support

If you encounter issues:
1. Check that the MCP SDK is installed: `npm list @modelcontextprotocol/sdk`
2. Verify the server path is correct
3. Restart Cursor after configuration changes
4. Check Cursor's MCP server logs for errors

---

**Remember**: This MCP server enforces your safety-first development workflow and will never allow automatic production database changes without explicit confirmation and passwords.
