set -e

INIT_PG_SCRIPT_SRC="scripts/sql/$1"
INIT_PG_SCRIPT_DST="supabase/migrations/$(date -u +%Y%m%d%H%M%S)_$1"

# check if `INIT_PG_SCRIPT_DST` does NOT exists
#   OR if `INIT_PG_SCRIPT_DST` is older than `INIT_PG_SCRIPT_SRC`
if [[ ! -e "$INIT_PG_SCRIPT_DST" || "$INIT_PG_SCRIPT_DST" -ot "$INIT_PG_SCRIPT_SRC" ]]; then
  cp -f -p "$INIT_PG_SCRIPT_SRC" "$INIT_PG_SCRIPT_DST"
fi
