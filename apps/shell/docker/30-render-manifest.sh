#!/bin/sh
set -e
# In production the shell (browser) fetches MF remotes cross-origin, so the
# manifest must point at each remote's PUBLIC URL. Locally the *_MFE_URL vars
# are unset and the built-in manifest (http://localhost:420x) is kept as-is.
if [ -n "$PROFILE_MFE_URL" ] || [ -n "$PREADVISORY_MFE_URL" ]; then
  profile="${PROFILE_MFE_URL:-http://localhost:4201}"
  preadvisory="${PREADVISORY_MFE_URL:-http://localhost:4202}"
  cat > /usr/share/nginx/html/mf.manifest.json <<EOF
{
  "profileMfe": "${profile}/remoteEntry.js",
  "preadvisoryMfe": "${preadvisory}/remoteEntry.js"
}
EOF
fi
