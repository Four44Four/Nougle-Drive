set -e

GREEN="\e[32m"
YELLOW="\e[33m"
RESET="\e[0m"

echo -e "${GREEN}Using Supabase version $(npx supabase --version)${RESET}"

if [ ! -d "supabase" ]; then
  echo "Supabase directory doesn't exist, initializing it"
  npx supabase init
  ./scripts/apply-supabase-rate-limiting.sh
  ./scripts/apply-supabase-totp-enroll-verify.sh
  ./scripts/apply-supabase-storage-schema-public-exposure.sh
fi

if [ ! -d "supabase/migrations" ]; then
  echo "Supabase directory migrations doesn't exist, creating it"
  mkdir supabase/migrations
fi

# copy all SQL files in scripts/sql/ into supabase/migrations/
for cur_file in $(ls -v "scripts/sql"); do
  if [ -f "scripts/sql/$cur_file" ]; then
    ./scripts/copy-migration.sh "$cur_file"
    sleep 1
  fi
done

if npx supabase status > /dev/null 2>&1; then
  ./scripts/create-supabase-storage-bucket.sh
  echo -e "${YELLOW}Supabase already up, applying migrations...${RESET}"
  npx supabase migration up
else
  echo -e "${YELLOW}Starting up Supabase instance${RESET}"
  npx supabase start
  ./scripts/create-supabase-storage-bucket.sh
fi
