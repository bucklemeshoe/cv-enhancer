## Database Safety Guardrails

Lightweight, practical protections to prevent accidental data loss while continuing to work directly with the cloud database.

### Must-have safeguards

- **Backups (automatic)**
  - Prefer PITR (Point-In-Time Recovery) if available in Supabase tier.
  - If not, schedule nightly logical dumps via GitHub Actions to a private bucket/S3 with 30–90 day retention.
  - Keep a “how to restore” doc and test restore quarterly.

- **Soft delete only**
  - Add `deleted_at TIMESTAMPTZ` to tables (e.g., `submissions`).
  - All app queries filter with `WHERE deleted_at IS NULL`.
  - Disable SQL DELETE in production (no RLS DELETE policy).

- **Change history (audit)**
  - Single trigger on `submissions` to record UPDATE/DELETE “before” snapshots with who, when, and operation.
  - Row-level rollback becomes quick without full DB restore.

### API and DB guardrails

- **Safe writes only**
  - Keep “smart merge + critical field validation” on `update-submission` to avoid null/blanking critical fields.
  - Add server-side SAFE_MODE env in prod to reject updates that would empty critical fields.

- **RLS and minimal privileges**
  - RLS ON for `submissions`.
  - Allow UPDATE via one RPC/function path only; no DELETE policy in prod.
  - Never expose service role key to the client.

- **Constraints for critical fields**
  - Promote `firstName`, `lastName`, `email` to real columns with `NOT NULL` and basic CHECKs.
  - Keep the rest as JSON to retain flexibility.

### Operational guardrails

- **Staging vs production**
  - Separate Supabase project and Netlify site for staging.
  - Default local `.env` to staging to reduce risk to prod.

- **Keys and access**
  - Rotate keys periodically.
  - Store prod service role only in serverless env vars.
  - Use a read-only DB role for ad-hoc inspections.

- **Destructive action confirmations**
  - In admin UI, require type-to-confirm (e.g., slug/id) for destructive actions and show diffs before save.

### Monitoring and recovery

- **Activity logging**
  - Log every admin update/delete intent (who, what, diff).
  - Optional Slack alert for unusual spikes (e.g., >25 updates or any delete in 5 minutes).

- **Recovery runbook**
  - One-page “Restore playbook” with exact commands to restore a row from audit history or from latest backup.
  - Test it with a quarterly fire drill.

### Minimal SQL examples

```sql
-- Soft delete column
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Block hard deletes in prod via RLS policy design
-- (Do not create a DELETE policy; only create SELECT/UPDATE/INSERT as needed.)

-- Audit table
CREATE TABLE IF NOT EXISTS submissions_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submission_id UUID NOT NULL,
  operation TEXT NOT NULL,            -- 'UPDATE' | 'DELETE'
  before_data JSONB,                  -- snapshot before change
  changed_by TEXT,                    -- user/email/service
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: on UPDATE/DELETE, write “before” row to history
CREATE OR REPLACE FUNCTION log_submission_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO submissions_history (submission_id, operation, before_data, changed_by)
  VALUES (OLD.id, TG_OP, to_jsonb(OLD), current_setting('request.jwt.claims', true));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_audit ON submissions;
CREATE TRIGGER submissions_audit
BEFORE UPDATE OR DELETE ON submissions
FOR EACH ROW EXECUTE FUNCTION log_submission_change();
```

### Implementation checklist (low-friction order)

1) Add `deleted_at` and ship soft delete in code paths; remove DELETE policy in prod.
2) Create `submissions_history` table and audit trigger.
3) Enforce critical field protection in API (safe mode) and via NOT NULL columns.
4) Enable PITR or nightly dumps; document restore steps; test once.
5) Separate staging from production and ensure local defaults point at staging.

### Restore playbook (outline)

1) Identify affected `submission_id` and time window.
2) Check `submissions_history` for the last good `before_data` prior to incident.
3) Restore fields with a targeted UPDATE using the snapshot JSON.
4) If table-wide incident: restore from PITR/snapshot to a temp DB, then run targeted INSERT/UPDATE back into prod.
5) Validate with application read path and re-run auto-publish if relevant.


