set -e

npx supabase gen types typescript --local > src/types/supabase.ts
