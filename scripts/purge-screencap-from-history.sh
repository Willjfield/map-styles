#!/usr/bin/env bash
# Remove public/MacOS3/screencap from the entire Git history so pushes stay under GitHub limits.
# Run from repo root: bash scripts/purge-screencap-from-history.sh
# Afterward: git push origin --force --all && git push origin --force --tags
set -euo pipefail

cd "$(dirname "$0")/.."

REMOVE_PATH="public/MacOS3/screencap"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository." >&2
  exit 1
fi

if git filter-repo --version >/dev/null 2>&1; then
  echo "Using git filter-repo (recommended)…"
  git filter-repo --path "$REMOVE_PATH" --invert-paths --force
elif command -v git-filter-repo >/dev/null 2>&1; then
  echo "Using git-filter-repo…"
  git-filter-repo --path "$REMOVE_PATH" --invert-paths --force
else
  echo "git filter-repo not found. Install: brew install git-filter-repo"
  echo "Falling back to git filter-branch (slower)…"
  git filter-branch --force --index-filter \
    "git rm -rf --cached --ignore-unmatch $REMOVE_PATH" \
    --prune-empty HEAD
fi

git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo
echo "Done. The folder is removed from all commits."
echo "Next: git push origin --force --all"
echo "      git push origin --force --tags   # if you use tags"
echo "Warn collaborators: they must re-clone or reset hard after this."
