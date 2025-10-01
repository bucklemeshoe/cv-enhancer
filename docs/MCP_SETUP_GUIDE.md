# 🛡️ CV Builder MCP Server Setup Guide

## Manual Setup in Cursor

### Step 1: Add Custom MCP Server
1. Go to **Cursor Settings** → **MCP** (where you are now)
2. Click **"New MCP Server"** (the + icon)
3. Fill in these exact details:

```
Name: cv-builder-workflow
Command: node
Arguments: /Users/jared/Development/pn/cv-builder/.cursor/cursor-mcp-server.js
Environment: NODE_ENV=development
```

### Step 2: Enable the Server
1. Toggle the server **ON** (green switch)
2. You should see it appear in your MCP servers list
3. The server will show "No tools, prompts, or resources" initially (this is normal)

### Step 3: Verify It's Working
- The server should show as **active** (green toggle)
- No error messages should appear
- The server will automatically enforce safety rules

## What This Does

✅ **Production Protection**: Blocks dangerous production operations  
✅ **Workflow Enforcement**: Maintains safety-first development  
✅ **Automatic Validation**: Every action I propose gets validated  
✅ **Safety Warnings**: Alerts when actions could affect production  

## Troubleshooting

If the server doesn't appear:
1. Make sure the path is exactly: `/Users/jared/Development/pn/cv-builder/.cursor/cursor-mcp-server.js`
2. Restart Cursor after adding the server
3. Check that the server shows as "active" (green toggle)

## Test Commands

The server provides these safety tools:
- `validate_production_safety`: Checks if operations are safe for production
- `check_workflow_compliance`: Ensures proper development workflow

Your safety-first development workflow is now permanently embedded! 🛡️
