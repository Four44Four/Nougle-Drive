# Purpose
 - Self hostable file/blob cloud storage
 - Supabase edition

# Setup DB
 - With current working directory in the project root:
    - Run `./scripts/init-supabase-db.sh`

# Generate DB types
 - Run `./scripts/gen-supabase-types.sh`

# Setup environment variables
 - Make a .env file with :
    - `VITE_SUPABASE_URL=http://127.0.0.1:54321`
    - `VITE_SUPABASE_KEY=sb_publishable_<...>`
       - Find this publishable key from `npx supabase status`
