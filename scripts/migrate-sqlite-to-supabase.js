#!/usr/bin/env node
/**
 * UghelliRides — SQLite → Supabase data migration
 *
 * Exports all rows from the local SQLite DB and inserts them into Supabase
 * (PostgreSQL), preserving row IDs so references like VH-00001 stay stable.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   DB_PATH=/path/to/ugHELLIRides.db \
 *   node scripts/migrate-sqlite-to-supabase.js
 *
 * Flags:
 *   --dry-run   Print what would be migrated without writing.
 *   --truncate  DELETE existing rows in the Supabase tables first (clean re-run).
 */
const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const TRUNCATE = process.argv.includes('--truncate');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'ugHELLIRides.db');

// ─── Validate inputs ───────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY. Set both and retry.');
  process.exit(1);
}
if (!require('fs').existsSync(DB_PATH)) {
  console.error(`✗ SQLite DB not found at ${DB_PATH}`);
  process.exit(1);
}

// ─── Status normalization (SQLite free-text → Supabase enums) ───
// vehicles/drivers:  pending | verified | active | rejected
// bookings:          new | assigned | completed | cancelled
const REG_STATUS = ['pending', 'verified', 'active', 'rejected'];
const BOOKING_STATUS = ['new', 'assigned', 'completed', 'cancelled'];

function normalizeStatus(table, status) {
  const s = String(status || '').trim().toLowerCase();
  if (table === 'bookings') {
    // Legacy bookings defaulted to 'new'; admin could previously set any of
    // ['pending','verified','active','rejected','completed']. Map old values onto
    // valid booking states sensibly.
    if (BOOKING_STATUS.includes(s)) return s;
    if (s === 'completed') return 'completed';
    if (s === 'verified' || s === 'active') return 'assigned';
    return 'new'; // pending / rejected / unknown → new
  }
  // vehicles / drivers
  if (REG_STATUS.includes(s)) return s;
  return 'pending';
}

// ─── Connect ───────────────────────────────────────────
const db = new Database(DB_PATH, { readonly: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLES = ['vehicles', 'drivers', 'bookings'];

async function main() {
  console.log('════════════════════════════════════════');
  console.log('  UghelliRides: SQLite → Supabase migration');
  console.log('  SQLite: ' + DB_PATH);
  console.log('  Supabase: ' + SUPABASE_URL);
  console.log('  Mode: ' + (DRY_RUN ? 'DRY-RUN (no writes)' : 'LIVE') + (TRUNCATE ? ' + TRUNCATE' : ''));
  console.log('════════════════════════════════════════\n');

  let grandTotal = 0;

  for (const table of TABLES) {
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id ASC`).all();
    console.log(`\n▶ ${table}: ${rows.length} row(s) in SQLite`);

    if (!rows.length) continue;

    // Map rows → Supabase shape (drop id? No — keep id to preserve references)
    const mapped = rows.map((r) => {
      const out = {};
      for (const [k, v] of Object.entries(r)) {
        if (k === 'created_at') {
          // SQLite CURRENT_TIMESTAMP → ISO 8601 (UTC). Supabase handles both,
          // but be explicit if it's a naive "YYYY-MM-DD HH:MM:SS".
          out[k] = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(v))
            ? String(v).replace(' ', 'T') + 'Z'
            : v;
        } else if (k === 'status') {
          out[k] = normalizeStatus(table, v);
        } else {
          out[k] = v;
        }
      }
      return out;
    });

    if (DRY_RUN) {
      console.log(`   → would insert ${mapped.length} row(s) (sample below):`);
      console.log('   ' + JSON.stringify(mapped[0]).slice(0, 300));
      grandTotal += mapped.length;
      continue;
    }

    if (TRUNCATE) {
      const { error } = await supabase.from(table).delete().neq('id', 0);
      if (error) {
        console.error(`   ✗ truncate ${table} failed: ${error.message}`);
        continue;
      }
      console.log(`   → truncated existing ${table}`);
      // Reset the identity sequence so new inserts continue from max(id)+1.
      try {
        await supabase.rpc('reset_identity', { tbl: table });
      } catch (_) { /* optional RPC; ignore if not defined */ }
    }

    // Insert in batches of 500 (PostgREST single-request ceiling).
    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < mapped.length; i += BATCH) {
      const chunk = mapped.slice(i, i + BATCH);
      const { data, error } = await supabase.from(table).insert(chunk);
      if (error) {
        console.error(`   ✗ batch ${Math.floor(i / BATCH) + 1} failed: ${error.message}`);
        // Continue with next batch rather than aborting the whole migration.
        continue;
      }
      inserted += (data || chunk).length;
    }
    console.log(`   ✓ inserted ${inserted} row(s)`);
    grandTotal += inserted;
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`  Done. ${grandTotal} row(s) ${DRY_RUN ? 'would be' : ''} migrated.`);
  console.log('════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('✗ Migration aborted:', e);
    process.exit(1);
  });
