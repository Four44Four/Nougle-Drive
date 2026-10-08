set -e

sed -i 's/schemas = \[\([^]]*\)\]/schemas = [\1, "storage"]/g; s/, "storage", "storage"/, "storage"/g; s/\[, /\[/g' ./supabase/config.toml
