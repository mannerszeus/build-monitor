#!/usr/bin/env bash
set -euo pipefail

ref="${VERCEL_GIT_COMMIT_REF:-}"
message="${VERCEL_GIT_COMMIT_MESSAGE:-}"

if [[ "$ref" == chore/framework-sync-* ]] || [[ "$message" == chore:\ sync\ AI\ framework* ]]; then
  echo "Framework-only sync: skip Vercel build."
  exit 0
fi

echo "Application change: Vercel build required."
exit 1
