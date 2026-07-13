#!/bin/sh
set -e
# In production the shell (browser) fetches the MF remote cross-origin, so the
# manifest must point at profile-mfe's PUBLIC URL. Locally PROFILE_MFE_URL is
# unset and the built-in manifest (http://localhost:4201) is kept as-is.
if [ -n "$PROFILE_MFE_URL" ]; then
  printf '{ "profileMfe": "%s/remoteEntry.js" }\n' "$PROFILE_MFE_URL" \
    > /usr/share/nginx/html/mf.manifest.json
fi
