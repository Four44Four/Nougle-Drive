set -e
sed -i '/^\[auth\.mfa\.totp\]/,/^\[/ {s/^[# ]*enroll_enabled\s*=\s*.*/enroll_enabled = true/; s/^[# ]*verify_enabled\s*=\s*.*/verify_enabled = true/}' \
  ./supabase/config.toml
