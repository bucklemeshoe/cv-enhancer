#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

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
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'validate_production_safety',
            description: 'Validates that no production database operations are being performed',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: 'The database operation being attempted'
                },
                environment: {
                  type: 'string',
                  description: 'The target environment'
                }
              },
              required: ['operation', 'environment']
            }
          },
          {
            name: 'check_workflow_compliance',
            description: 'Ensures development workflow compliance',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  description: 'The action being performed'
                },
                branch: {
                  type: 'string',
                  description: 'The current git branch'
                }
              },
              required: ['action', 'branch']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'validate_production_safety':
          return this.validateProductionSafety(args);
        case 'check_workflow_compliance':
          return this.checkWorkflowCompliance(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async validateProductionSafety(args) {
    const { operation, environment } = args;
    
    if (environment === 'production') {
      return {
        content: [
          {
            type: 'text',
            text: `🚨 PRODUCTION SAFETY ALERT: Blocking ${operation} on production environment. This requires explicit password confirmation.`
          }
        ],
        isError: true
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Safe to proceed with ${operation} on ${environment}`
        }
      ]
    };
  }

  async checkWorkflowCompliance(args) {
    const { action, branch } = args;
    
    if (branch === 'main' && action !== 'read') {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ WORKFLOW WARNING: Performing ${action} on main branch. Ensure this is intentional.`
          }
        ],
        isError: false
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Workflow compliant: ${action} on ${branch}`
        }
      ]
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
