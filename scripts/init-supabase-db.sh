set -e

GREEN="\e[32m"
YELLOW="\e[33m"
RESET="\e[0m"

echo -e "${GREEN}Using Supabase version $(npx supabase --version)${RESET}"

if [ ! -d "supabase" ]; then
  echo "Supabase directory doesn't exist, initializing it"
  npx supabase init
fi

if [ ! -d "supabase/migrations" ]; then
  echo "Supabase directory migrations doesn't exist, creating it"
  mkdir supabase/migrations
fi

INIT_PG_SCRIPT_SRC="scripts/sql/init_supabase_pg.sql"
INIT_PG_SCRIPT_DST="supabase/migrations/$(date -u +%Y%m%d%H%M%S)_init_supabase_pg.sql"

# check if `INIT_PG_SCRIPT_SRC` does NOT exists
#   OR if `INIT_PG_SCRIPT_DST` is older than `INIT_PG_SCRIPT_SRC`
if [[ ! -e "$INIT_PG_SCRIPT_DST" || "$INIT_PG_SCRIPT_DST" -ot "$INIT_PG_SCRIPT_SRC" ]]; then
  cp -f "$INIT_PG_SCRIPT_SRC" "$INIT_PG_SCRIPT_DST"
fi

if npx supabase status > /dev/null 2>&1; then
  echo -e "${YELLOW}Supabase already up, applying migrations...${RESET}"
  npx supabase migration up
else
  echo -e "${YELLOW}Starting up Supabase instance${RESET}"
  npx supabase start
fi
