#!/usr/bin/env bash
# Apply every Lifestyle migration to a throwaway Postgres, then run the
# database tests. Proves a migration applies to the real schema before it is
# pointed at Staging.
set -euo pipefail

PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK=${WORK:-/var/tmp/gutguard-pgtest}
PORT=${PORT:-5433}

export PATH="$PGBIN:$PATH" PGHOST="$WORK" PGPORT="$PORT" PGUSER=postgres

cleanup() { pg_ctl -D "$WORK/pgdata" stop -m immediate >/dev/null 2>&1 || true; }
trap cleanup EXIT

rm -rf "$WORK"; mkdir -p "$WORK/pgdata"; chmod 755 "$WORK"
if [ "$(id -u)" = 0 ]; then chown -R postgres "$WORK"; AS="su postgres -c"; else AS="bash -c"; fi

$AS "PATH=$PGBIN:\$PATH initdb -D $WORK/pgdata -A trust -U postgres" >/dev/null
$AS "PATH=$PGBIN:\$PATH pg_ctl -D $WORK/pgdata -o '-k $WORK -p $PORT -c listen_addresses=' -l $WORK/pg.log start -w" >/dev/null

psql -q -v ON_ERROR_STOP=1 -d postgres -f "$HERE/bootstrap_local.sql"

for f in "$HERE"/../migrations/*.sql; do
  printf '%-52s ' "$(basename "$f")"
  psql -q -v ON_ERROR_STOP=1 -d postgres -f "$f" >/dev/null 2>"$WORK/err.log" \
    && echo applied || { echo FAILED; cat "$WORK/err.log"; exit 1; }
done

# Supabase grants ALL on public tables to anon/authenticated by default. Without
# this the column REVOKE in Change 3 is a no-op and its test passes for the
# wrong reason.
psql -q -v ON_ERROR_STOP=1 -d postgres -c "
grant usage on schema public, auth to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
grant select on auth.users to authenticated;"

# Re-apply so the REVOKE runs against the real grants.
psql -q -v ON_ERROR_STOP=1 -d postgres \
  -f "$HERE/../migrations/20260904000000_shared_person_profiles.sql" >/dev/null

for t in "$HERE"/database/*.test.sql; do
  printf '%-52s ' "$(basename "$t")"
  psql -q -X -v ON_ERROR_STOP=1 -d postgres -f "$t" >/dev/null 2>"$WORK/err.log" \
    && echo PASS || { echo FAIL; cat "$WORK/err.log"; exit 1; }
done

echo "all green"
