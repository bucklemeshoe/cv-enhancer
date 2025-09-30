#!/usr/bin/env node

/**
 * Dry Run Database Validation
 * Validates schema changes without affecting production database
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Database Dry Run Validation...\n');

// Check for migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const schemaFile = path.join(process.cwd(), 'supabase-schema.sql');

const validations = [
  {
    name: 'Migration Files Check',
    validate: () => {
      if (!fs.existsSync(migrationsDir)) {
        return { status: 'warning', message: 'No migrations directory found' };
      }
      
      const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
      if (migrations.length === 0) {
        return { status: 'info', message: 'No new migrations detected' };
      }
      
      return { status: 'success', message: `Found ${migrations.length} migration(s)` };
    }
  },
  {
    name: 'Schema File Check',
    validate: () => {
      if (!fs.existsSync(schemaFile)) {
        return { status: 'error', message: 'supabase-schema.sql not found' };
      }
      
      const content = fs.readFileSync(schemaFile, 'utf8');
      if (content.trim().length === 0) {
        return { status: 'error', message: 'Schema file is empty' };
      }
      
      return { status: 'success', message: 'Schema file exists and has content' };
    }
  },
  {
    name: 'SQL Syntax Check',
    validate: () => {
      if (!fs.existsSync(schemaFile)) {
        return { status: 'skip', message: 'No schema file to validate' };
      }
      
      const content = fs.readFileSync(schemaFile, 'utf8');
      
      // Basic SQL syntax checks
      const dangerousPatterns = [
        /DROP\s+DATABASE/i,
        /DROP\s+SCHEMA/i,
        /TRUNCATE/i,
        /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          return { 
            status: 'error', 
            message: `Dangerous SQL pattern detected: ${pattern.source}` 
          };
        }
      }
      
      return { status: 'success', message: 'No dangerous SQL patterns detected' };
    }
  },
  {
    name: 'Critical Tables Check',
    validate: () => {
      if (!fs.existsSync(schemaFile)) {
        return { status: 'skip', message: 'No schema file to validate' };
      }
      
      const content = fs.readFileSync(schemaFile, 'utf8');
      const criticalTables = ['submissions'];
      
      for (const table of criticalTables) {
        if (!content.includes(`CREATE TABLE ${table}`) && 
            !content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
          return { 
            status: 'warning', 
            message: `Critical table '${table}' not found in schema` 
          };
        }
      }
      
      return { status: 'success', message: 'All critical tables present' };
    }
  }
];

console.log('📋 Running database validations:\n');

let hasErrors = false;
let hasWarnings = false;

for (const validation of validations) {
  try {
    console.log(`⏳ ${validation.name}...`);
    const result = validation.validate();
    
    switch (result.status) {
      case 'success':
        console.log(`✅ ${validation.name} - ${result.message}\n`);
        break;
      case 'warning':
        console.log(`⚠️  ${validation.name} - ${result.message}\n`);
        hasWarnings = true;
        break;
      case 'error':
        console.log(`❌ ${validation.name} - ${result.message}\n`);
        hasErrors = true;
        break;
      case 'skip':
        console.log(`⏭️  ${validation.name} - ${result.message}\n`);
        break;
    }
  } catch (error) {
    console.log(`❌ ${validation.name} - ERROR: ${error.message}\n`);
    hasErrors = true;
  }
}

// Summary
console.log('📊 Database Dry Run Summary:');
if (hasErrors) {
  console.log('❌ Database validation failed - Fix issues before merging');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Database validation passed with warnings - Review recommended');
  process.exit(0);
} else {
  console.log('✅ Database validation passed - Safe to merge');
  process.exit(0);
}
