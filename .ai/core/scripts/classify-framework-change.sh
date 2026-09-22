#!/usr/bin/env bash
set -euo pipefail

base="${1:-}"
head="${2:-HEAD}"

if [ -z "$base" ]; then
  echo "usage: $0 <base-ref> [head-ref]" >&2
  exit 2
fi

changed_output="$(git diff --name-only "$base" "$head")"
if [ -z "$changed_output" ]; then
  echo "framework_only=false"
  exit 0
fi
mapfile -t changed <<<"$changed_output"
framework_only=true
for path in "${changed[@]}"; do
  case "$path" in
    .ai/FRAMEWORK_VERSION|.ai/core/*|.ai/roles/*) ;;
    *) framework_only=false; break ;;
  esac
done
echo "framework_only=$framework_only"
