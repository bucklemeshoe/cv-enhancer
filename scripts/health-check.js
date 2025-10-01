#!/usr/bin/env node

/**
 * Health Check Script for CV Builder
 * Runs on commits/pushes to validate code quality and functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running CV Builder Health Checks...\n');

const checks = [
  {
    name: 'Build Check',
    command: 'npm run build',
    critical: true
  },
  {
    name: 'Lint Check', 
    command: 'npm run lint',
    critical: false
  },
  {
    name: 'Type Check',
    command: 'npx tsc --noEmit',
    critical: true
  }
];

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

console.log('📋 Running checks:\n');

for (const check of checks) {
  try {
    console.log(`⏳ ${check.name}...`);
    execSync(check.command, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${check.name} - PASSED\n`);
    results.passed++;
  } catch (error) {
    if (check.critical) {
      console.log(`❌ ${check.name} - FAILED (CRITICAL)\n`);
      console.log(error.stdout?.toString() || error.message);
      results.failed++;
    } else {
      console.log(`⚠️  ${check.name} - WARNING\n`);
      console.log(error.stdout?.toString() || error.message);
      results.warnings++;
    }
  }
}

// Summary
console.log('📊 Health Check Summary:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`❌ Failed: ${results.failed}`);

if (results.failed > 0) {
  console.log('\n🚨 CRITICAL CHECKS FAILED - Please fix before pushing');
  process.exit(1);
} else if (results.warnings > 0) {
  console.log('\n⚠️  Some warnings detected - Review recommended');
  process.exit(0);
} else {
  console.log('\n🎉 All health checks passed!');
  process.exit(0);
}
