# Development Workflow & Safety Guidelines

## 🛡️ Safety-First Development Process

This document outlines our development workflow designed to protect production data while enabling safe local development and testing.

## 🔄 Workflow Overview

### 1. Local Development
- **Local Supabase**: All development happens against local database instance
- **Schema Changes**: Only modify local DB schema, never production
- **Code Changes**: All development on `develop` or feature branches
- **Safe Testing**: Full testing environment without production risk

### 2. Git Workflow & Safety Checks

#### On Commit/Push
- ✅ **Health Checks**: Automatic validation of code quality and functionality
- ✅ **Build Verification**: Ensures code compiles and passes tests
- ✅ **Lint Checks**: Code quality and style validation

#### On Pull Request to Develop
- ✅ **Dry Run DB Checks**: Schema validation without affecting production
- ✅ **Migration Testing**: Validates SQL syntax and safety
- ✅ **Critical Table Checks**: Ensures essential tables are preserved

#### Production Deployment
- ✅ **Manual Approval**: All production changes require explicit approval
- ✅ **Password Protection**: Production migrations require DB credentials
- ✅ **No Automation**: Zero automatic production database changes

## 🚀 Getting Started

### Local Development Setup
```bash
# Start local Supabase
supabase start

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
- **Local**: Uses `.env.local` with local Supabase credentials
- **Production**: Uses production environment variables (never auto-updated)

## 🔍 Health Checks

### Automatic Checks (on commit/push)
- **Build Check**: `npm run build`
- **Lint Check**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`

### Database Validation (on PR)
- **Migration Files**: Validates migration structure
- **SQL Syntax**: Checks for dangerous patterns
- **Critical Tables**: Ensures essential tables exist
- **Schema Integrity**: Validates schema consistency

## 🛡️ Safety Guarantees

### What We Will Do
- ✅ Run health checks on commits
- ✅ Validate schema changes with dry runs
- ✅ Ask for passwords before any production migration
- ✅ Never touch production data without explicit permission

### What We Will Never Do
- ❌ Automatically update production database
- ❌ Flush or delete production data
- ❌ Run migrations without explicit approval and passwords
- ❌ Make production changes without confirmation

## 📋 Migration Process

### Local Development
1. Make schema changes in local Supabase
2. Export schema: `supabase db dump --schema-only > supabase-schema.sql`
3. Create migration: `supabase migration new <description>`
4. Test locally with full data flow

### Production Deployment
1. **Merge to develop**: After all checks pass
2. **Merge to main**: When ready for production
3. **Run migration safety wrapper**: `node scripts/migration-safety.js`
4. **Enter production credentials**: Required for every migration
5. **Confirm changes**: Explicit approval for each production change

## 🔧 Scripts Available

### Health Check
```bash
node scripts/health-check.js
```
Runs build, lint, and type checks.

### Database Dry Run
```bash
node scripts/dry-run-db.js
```
Validates schema changes without affecting production.

### Migration Safety
```bash
node scripts/migration-safety.js
```
Safely runs production migrations with password protection.

## 🚨 Emergency Procedures

### If Production Data is at Risk
1. **Stop all automated processes**
2. **Assess the situation** using Supabase dashboard
3. **Restore from backup** if necessary
4. **Document the incident** and update safety procedures

### Recovery Steps
1. Check audit logs in `submissions_history` table
2. Restore from latest backup if needed
3. Validate data integrity
4. Update safety procedures

## 📞 Support

For questions about this workflow or safety procedures, refer to:
- **Database Guardrails**: `docs/DATABASE_GUARDRAILS.md`
- **Project Guide**: `docs/PROJECT_GUIDE.md`
- **Supabase Documentation**: https://supabase.com/docs

---

**Remember**: When in doubt, ask for confirmation. Production data safety is our top priority.
