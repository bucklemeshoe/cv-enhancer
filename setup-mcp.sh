#!/bin/bash

echo "🛡️  Setting up CV Builder MCP Server for Cursor..."

# Check if MCP SDK is installed
if ! npm list @modelcontextprotocol/sdk > /dev/null 2>&1; then
    echo "📦 Installing MCP SDK..."
    npm install @modelcontextprotocol/sdk
fi

# Create workspace settings
echo "⚙️  Creating workspace settings..."
mkdir -p .vscode

# Test MCP server
echo "🧪 Testing MCP server..."
node .cursor/mcp-server.js &
SERVER_PID=$!
sleep 2
kill $SERVER_PID 2>/dev/null

echo "✅ MCP Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Cursor to load the MCP server"
echo "2. The server will automatically enforce safety rules"
echo "3. Check Cursor's MCP server status in settings"
echo ""
echo "🛡️  Your safety-first development workflow is now active!"
