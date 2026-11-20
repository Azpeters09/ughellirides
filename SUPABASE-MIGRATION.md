# UghelliRides — Supabase Migration Runbook

One-page guide to move the backend from local SQLite to Supabase (PostgreSQL).
Each step is copy-paste ready. Estimated time: ~5 minutes once OAuth is done.

---

## 0. Pre-flight checklist

- [ ] Supabase account exists (free tier is plenty): https://supabase.com
- [ ] A project is created (note the **Project Ref** — the `xxxx` in `https://xxxx.supabase.co`)
- [ ] Hermes Supabase MCP is authorized (see step 1)

---

## 1. Authorize Supabase MCP (one-time)

From your SSH terminal:

```bash
hermes mcp login supabase
```

Open the printed URL in your browser → log in → approve. Verify:

```bash
hermes mcp list     # supabase → "✓ enabled"
```

---

## 2. Create the database schema

**Option A — via Hermes (preferred, once MCP is live):** just tell me "run the
Supabase schema" and I'll execute `supabase/schema.sql` through the MCP.

**Option B — manually:** Supabase Dashboard → **SQL Editor** → New query →
paste the entire contents of `supabase/schema.sql` → **Run**.

What it creates:
- `vehicles`, `drivers`, `bookings` tables (with `status` enums)
- Indexes on `phone`, `plate_number`, `status`, `created_at`
- Row Level Security enabled (deny-all by default; service role bypasses)
- `reset_identity()` RPC (used by the migration script's `--truncate` flag)

---

## 3. Grab your API keys

Supabase Dashboard → **Project Settings** → **API**:

| Key | Where it goes |
|---|---|
| Project URL (`https://xxxx.supabase.co`) | `SUPABASE_URL` |
| `service_role` (secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **Never expose the `service_role` key.** It bypasses RLS. It goes in the
> server's `.env` only — never in the frontend HTML/JS.

---

## 4. Migrate existing data (optional — only if SQLite has rows)

Check if there's data to move:

```bash
ls -la /root/ughelli-rides/data/
```

If `ugHELLIRides.db` has size > 0, migrate it:

```bash
cd /root/ughelli-rides

# Preview (no writes):
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node scripts/migrate-sqlite-to-supabase.js --dry-run

# Run for real:
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node scripts/migrate-sqlite-to-supabase.js

# (Re-run cleanly after a botched attempt: add --truncate)
```

Reference IDs (`VH-00001`, `DR-00001`, `BK-00001`) are preserved because row
IDs carry over.

---

## 5. Point the backend at Supabase

Add to the production `.env` (alongside `PORT` and `ADMIN_TOKEN`):

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart:

```bash
cd /root/ughelli-rides && pm2 restart ughellirides
# or, if running with plain node:
# pkill -f "node server.js" && node server.js
```

Verify the backend flipped to cloud storage:

```bash
curl -s http://localhost:8787/api/health
# → {"ok":true,"backend":"supabase"}   ← must say "supabase"
```

---

## 6. Smoke-test the live path

```bash
curl -s -X POST http://localhost:8787/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"owner_name":"Smoke Test","phone":"08000000000","make_model":"Honda","plate_number":"TEST 001","city":"Ughelli","address":"1 Test St"}'
# → {"ok":true,"reference":"VH-00002"}

curl -s http://localhost:8787/api/admin/vehicles -H "Authorization: Bearer $ADMIN_TOKEN"
# → should list the new row + migrated rows
```

Then delete the smoke-test row from the Supabase dashboard (or leave it — it's
harmless, but cleaner to remove).

---

## Rollback (if anything breaks)

The backend auto-falls-back to SQLite when `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
are empty. To roll back:

```bash
# Remove the two Supabase lines from .env, then:
pm2 restart ughellirides
# /api/health → {"backend":"sqlite"}
```

No data is lost — SQLite still has its original rows untouched.

---

## Reference — file map

| File | Purpose |
|---|---|
| `supabase/schema.sql` | Table/enum/index/RLS definitions |
| `scripts/migrate-sqlite-to-supabase.js` | SQLite → Supabase data port |
| `lib/store-supabase.js` | Supabase storage adapter |
| `lib/store-sqlite.js` | SQLite storage adapter (fallback) |
| `server.js` | Backend-agnostic Express API |
| `.env.example` | Documented env vars |
