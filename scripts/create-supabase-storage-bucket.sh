GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
RESET="\e[0m"

set -euo pipefail

# use env vars from `.env`
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo -e "${RED}.env file not found${RESET}"
    exit 1
fi

BUCKET_NAME="main_files"

# every user has a file name prepended by their user id and a `-`

BUCKET_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "$VITE_SUPABASE_URL/storage/v1/bucket/$BUCKET_NAME" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_SECRET_KEY" \
  -H "ApiKey: $SUPABASE_SERVICE_SECRET_KEY")

if [ "$BUCKET_STATUS_CODE" -eq 200 ]; then
  echo -e "${YELLOW}Bucket '$BUCKET_NAME' already exists, skipping creating it...${RESET}"
#elif [ "$BUCKET_STATUS_CODE" -eq 404 ]; then
else
  echo -e "${YELLOW}Bucket '$BUCKET_NAME' doesn't exist, creating it...${RESET}"
  CREATE_STATUS_CODE=$(curl -X POST -s  -o /dev/null -w "%{http_code}" \
      "$VITE_SUPABASE_URL/storage/v1/bucket" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_SECRET_KEY" \
      -H "ApiKey: $SUPABASE_SERVICE_SECRET_KEY" \
      -H "Content-Type: application/json" \
      -d @- <<EOF
{
  "id": "$BUCKET_NAME",
  "name": "$BUCKET_NAME",
  "public": false
}
EOF)

  if [ "$CREATE_STATUS_CODE" -eq 200 ]; then
    echo -e "\n${GREEN}Bucket '$BUCKET_NAME' successfully created${RESET}"
  fi
# else
#   echo -e "${RED}Unknown response status code${RESET} when checking bucket '$BUCKET_NAME' status: $BUCKET_STATUS_CODE"
#   exit 1
fi
