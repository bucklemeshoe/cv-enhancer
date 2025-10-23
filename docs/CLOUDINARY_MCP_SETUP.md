# 🖼️ Cloudinary MCP Servers Setup Guide

## Overview

The Cloudinary MCP servers have been successfully added to your configuration! These servers provide comprehensive media management capabilities directly through AI applications like Cursor.

## Installed MCP Servers

### 1. **Asset Management Server**
- **URL**: `https://asset-management.mcp.cloudinary.com/sse`
- **Capabilities**: Upload, manage, and transform media assets with advanced search and organization
- **Features**: Handle images, videos, raw files, folders, tags, and asset relationships

### 2. **Environment Config Server**
- **URL**: `https://environment-config.mcp.cloudinary.com/sse`
- **Capabilities**: Configure and manage Cloudinary environment settings
- **Features**: Upload presets, transformation settings, streaming profiles, webhook notifications

### 3. **Structured Metadata Server**
- **URL**: `https://structured-metadata.mcp.cloudinary.com/sse`
- **Capabilities**: Create, manage, and query structured metadata fields
- **Features**: Enhanced asset organization and searchability with conditional metadata rules

### 4. **Analysis Server**
- **URL**: `https://analysis.mcp.cloudinary.com/sse`
- **Capabilities**: AI-powered content analysis and moderation
- **Features**: Auto-tagging, object detection, content moderation, quality analysis

### 5. **MediaFlows Server**
- **URL**: `https://mediaflows.mcp.cloudinary.com/v2/mcp`
- **Capabilities**: Build and manage workflow automations
- **Features**: Low-code workflow automations with AI-powered assistance

## Authentication Setup

Your Cloudinary credentials have been configured! Here are your specific settings:

### Your Cloudinary Credentials
- **Cloud Name**: `dokcs4daz`
- **API Key**: `172165474278718`
- **API Secret**: `qGhgTVutnXU6C_3MtSZ3XJ2MLTY`
- **CLOUDINARY_URL**: `cloudinary://172165474278718:qGhgTVutnXU6C_3MtSZ3XJ2MLTY@dokcs4daz`

### Quick Setup
Run the setup script to configure your environment:
```bash
./setup-cloudinary-env.sh
```

### Manual Environment Variables
```bash
export CLOUDINARY_CLOUD_NAME="dokcs4daz"
export CLOUDINARY_API_KEY="172165474278718"
export CLOUDINARY_API_SECRET="qGhgTVutnXU6C_3MtSZ3XJ2MLTY"
export CLOUDINARY_URL="cloudinary://172165474278718:qGhgTVutnXU6C_3MtSZ3XJ2MLTY@dokcs4daz"
```

### MediaFlows Configuration
The MediaFlows server is already configured with your credentials in the MCP configuration files.

## Getting Your Cloudinary Credentials

1. Go to your [Cloudinary Console Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Security**
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

## Usage Examples

Once configured, you can use natural language to:

### Asset Management
- "Upload an image to Cloudinary"
- "Search for all images with the tag 'portfolio'"
- "Transform this image to 300x300 pixels"
- "Create a zip archive of all my assets"

### Analysis
- "Analyze this image for content moderation"
- "Generate auto-tags for this video"
- "Detect objects in this image"

### MediaFlows
- "Create a workflow that auto-tags uploaded images"
- "Set up automatic image optimization for web"
- "Build a moderation pipeline for user uploads"

## Configuration Files Updated

The following files have been updated with Cloudinary MCP server configurations:
- `/Users/jared/Development/pn/cv-builder/.cursor/mcp-config.json`
- `/Users/jared/Development/pn/cv-builder/.cursor/cursor-mcp-config.json`

## Next Steps

1. **Configure Authentication**: Set up your Cloudinary credentials using one of the methods above
2. **Restart Cursor**: Restart Cursor to load the new MCP servers
3. **Test the Integration**: Try asking me to help with media management tasks
4. **Explore Features**: Start with simple tasks like uploading or analyzing images

## Troubleshooting

### Server Not Appearing
- Ensure you've restarted Cursor after adding the configuration
- Check that the URLs are accessible from your network
- Verify your Cloudinary credentials are correct

### Authentication Issues
- Double-check your Cloudinary credentials in the console
- Ensure your account has the necessary permissions
- For MediaFlows, make sure headers are properly configured

### Performance Issues
- Use specific queries to avoid large result sets
- Break complex operations into smaller tasks
- Use filtering parameters to limit scope

## Paid Features

Some advanced features may require a paid Cloudinary plan:
- Advanced AI analysis features
- High-volume API usage
- Custom metadata fields
- Advanced transformation capabilities

## Support

For detailed documentation and troubleshooting:
- [Cloudinary MCP Documentation](https://github.com/cloudinary/mcp-servers)
- [Cloudinary Console](https://cloudinary.com/console)
- [Cloudinary Support](https://support.cloudinary.com/)

Your Cloudinary MCP servers are now ready to use! 🚀
