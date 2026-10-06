set -e
# TODO: when transitioning to non-supabase backend, make the rate limits apply to DB operations too via Redis
sed -i 's/^[# ]*sign_in_sign_ups\s*=\s*.*/sign_in_sign_ups = 10/' ./supabase/config.toml
