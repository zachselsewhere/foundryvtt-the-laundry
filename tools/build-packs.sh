#!/usr/bin/env bash
# Compile every source folder in src/packs/ into the LevelDB compendium packs in
# packs/ that Foundry actually reads. Run this after editing anything under
# src/packs/. The release workflow runs the same step automatically, so you only
# need this for local testing / manual installs.
#
#   ./tools/build-packs.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

for dir in src/packs/*/; do
  name="$(basename "$dir")"
  echo "Compiling src/packs/${name} -> packs/${name} ..."
  rm -rf "packs/${name}"
  npx --yes @foundryvtt/foundryvtt-cli@latest package pack \
    --id the-laundry --type System \
    -n "${name}" \
    --in "src/packs/${name}" \
    --out packs
done

echo "Done. All packs rebuilt."
