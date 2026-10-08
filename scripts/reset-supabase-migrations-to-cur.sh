set -e

YELLOW="\e[33m"
RESET="\e[0m"

if npx supabase status > /dev/null 2>&1; then
  echo -e "${YELLOW}Supabase already up...${RESET}"
  npx supabase db reset
  ./scripts/create-supabase-storage-bucket.sh
else
  echo -e "${YELLOW}Starting up Supabase instance${RESET}"
  npx supabase start
  npx supabase db reset
  ./scripts/create-supabase-storage-bucket.sh
fi
