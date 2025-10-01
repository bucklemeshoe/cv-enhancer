#!/usr/bin/env node

/**
 * MCP Server for CV Builder Development Workflow
 * Provides safety-first development guidelines and workflow management
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

class CVBuilderWorkflowServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cv-builder-workflow',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_workflow_guidelines',
            description: 'Get the safety-first development workflow guidelines',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'check_safety_rules',
            description: 'Check if a proposed action follows safety rules',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  description: 'The action being proposed',
                },
                context: {
                  type: 'string',
                  description: 'Context about the action',
                },
              },
              required: ['action'],
            },
          },
          {
            name: 'get_database_protection_status',
            description: 'Get current database protection status and rules',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'validate_production_action',
            description: 'Validate if a production action is safe to proceed',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  description: 'The production action being considered',
                },
                hasPassword: {
                  type: 'boolean',
                  description: 'Whether production password is available',
                },
                hasConfirmation: {
                  type: 'boolean',
                  description: 'Whether explicit confirmation has been given',
                },
              },
              required: ['action', 'hasPassword', 'hasConfirmation'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_workflow_guidelines':
          return this.getWorkflowGuidelines();

        case 'check_safety_rules':
          return this.checkSafetyRules(args.action, args.context);

        case 'get_database_protection_status':
          return this.getDatabaseProtectionStatus();

        case 'validate_production_action':
          return this.validateProductionAction(args.action, args.hasPassword, args.hasConfirmation);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  getWorkflowGuidelines() {
    return {
      content: [
        {
          type: 'text',
          text: `# CV Builder Safety-First Development Workflow

## 🛡️ CRITICAL SAFETY RULES

### Database Protection
- NEVER automatically update production database
- NEVER flush or delete production data
- ALWAYS require explicit passwords for production migrations
- ALWAYS ask for confirmation before any production changes
- ONLY work with local Supabase for development

### Development Process
1. **Local Development**: All work on local Supabase instance
2. **Schema Changes**: Only modify local DB schema
3. **Code Changes**: Use \`develop\` or feature branches
4. **Health Checks**: Run automatically on commits/pushes
5. **PR Validation**: Dry run DB checks for PRs to develop
6. **Production**: Manual approval + passwords required

### Safety Guarantees
- ✅ Run health checks on commits
- ✅ Validate schema changes with dry runs
- ✅ Ask for passwords before production migrations
- ✅ Never touch production data without explicit permission

### What I Will NEVER Do
- ❌ Automatically update production database
- ❌ Flush or delete production data
- ❌ Run migrations without explicit approval and passwords
- ❌ Make production changes without confirmation

**Remember: When in doubt, ask for confirmation. Production data safety is the top priority.**`,
        },
      ],
    };
  }

  checkSafetyRules(action, context = '') {
    const dangerousActions = [
      'update production database',
      'flush production data',
      'delete production data',
      'run production migration',
      'modify production schema',
      'touch production',
    ];

    const isDangerous = dangerousActions.some(dangerous => 
      action.toLowerCase().includes(dangerous)
    );

    if (isDangerous) {
      return {
        content: [
          {
            type: 'text',
            text: `🚨 SAFETY WARNING: "${action}" is a production action!

⚠️  This action requires:
- Explicit user confirmation
- Production database password
- Manual approval

🛡️  Safety Rules:
- NEVER automatically update production
- ALWAYS ask for confirmation
- ALWAYS require passwords for production changes

Please confirm you want to proceed with this production action.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Action "${action}" appears safe for local development.

Context: ${context || 'No additional context provided'}

🛡️  Remember: Always use local Supabase for development and testing.`,
        },
      ],
    };
  }

  getDatabaseProtectionStatus() {
    return {
      content: [
        {
          type: 'text',
          text: `# Database Protection Status

## 🛡️ Current Protection Level: MAXIMUM

### Active Protections
- ✅ Local Supabase for development
- ✅ Health checks on commits
- ✅ Dry run validation for PRs
- ✅ Password protection for production
- ✅ Manual approval required

### Safety Rules Active
- 🚫 NO automatic production updates
- 🚫 NO automatic data flushing
- 🚫 NO production changes without passwords
- 🚫 NO production changes without confirmation

### Emergency Procedures
If production data is at risk:
1. Stop all automated processes
2. Assess using Supabase dashboard
3. Restore from backup if necessary
4. Document incident and update procedures

**Status: PROTECTED** 🛡️`,
        },
      ],
    };
  }

  validateProductionAction(action, hasPassword, hasConfirmation) {
    if (!hasPassword) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ PRODUCTION ACTION BLOCKED

Action: "${action}"
Reason: Production database password required

🛡️  To proceed:
1. Provide production database password
2. Confirm you understand the risks
3. Explicitly approve the action

This is a safety measure to protect your production data.`,
          },
        ],
      };
    }

    if (!hasConfirmation) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️  PRODUCTION ACTION PENDING CONFIRMATION

Action: "${action}"
Password: ✅ Available
Confirmation: ❌ Required

🛡️  Please explicitly confirm:
- You understand this will modify production data
- You have reviewed the changes
- You approve this action

Type "CONFIRM PRODUCTION" to proceed.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ PRODUCTION ACTION APPROVED

Action: "${action}"
Password: ✅ Available
Confirmation: ✅ Given

🛡️  Safety checks passed. Proceeding with production action.

⚠️  Remember: This will modify live production data.`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CV Builder Workflow MCP Server running...');
  }
}

const server = new CVBuilderWorkflowServer();
server.run().catch(console.error);
