#!/bin/sh
# Runs the branding gate, then checks the gate did not under-report its file count.
# A fixture proves one file. This denominator proves the file set.
#
# Fails when the gate accounted for fewer files than `git ls-files` plus
# `find dist -type f`. That is the failure a glob which silently skips .html,
# .css, .json or .svg produces. Accounted means scanned plus binary skipped.
#
# Usage: sh scripts/check-branding-count.sh [gate arguments]
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

status=0
output=$(node "$here/check-branding.mjs" "$@") || status=$?
printf '%s\n' "$output"
if [ "$status" -ne 0 ]; then
  exit "$status"
fi

counts=$(printf '%s\n' "$output" | grep '^branding-gate: files_scanned=' | head -n 1)
scanned=$(printf '%s\n' "$counts" | sed -n 's/.*files_scanned=\([0-9][0-9]*\).*/\1/p')
skipped=$(printf '%s\n' "$counts" | sed -n 's/.*binary_skipped=\([0-9][0-9]*\).*/\1/p')
if [ -z "$scanned" ] || [ -z "$skipped" ]; then
  echo "branding-count: the gate printed no files_scanned line" >&2
  exit 3
fi

# A binary file is skipped on purpose, so it counts towards the denominator. An
# unreadable file counts towards neither, which is how it turns this check red.
accounted=$((scanned + skipped))

tracked=$(git ls-files | wc -l)
built=0
if [ -d dist ]; then
  built=$(find dist -type f | wc -l)
fi
expected=$((tracked + built))

if [ "$accounted" -lt "$expected" ]; then
  echo "branding-count: FAIL gate accounted for $accounted files, expected at least $expected" >&2
  echo "branding-count: shortfall=$((expected - accounted)) scanned=$scanned" \
    "binary_skipped=$skipped tracked=$tracked dist=$built" >&2
  exit 1
fi

echo "branding-count: OK accounted=$accounted expected=$expected scanned=$scanned" \
  "binary_skipped=$skipped tracked=$tracked dist=$built"
