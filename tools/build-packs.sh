#!/usr/bin/env bash
# Compile the source JSON in src/packs/ into the LevelDB compendium packs in
# packs/ that Foundry actually reads. Run this after editing anything under
# src/packs/. The release workflow runs the same step automatically, so you only
# need this for local testing / manual installs.
#
#   ./tools/build-packs.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

PACK="tools-of-the-trade"

echo "Compiling src/packs/${PACK} -> packs/${PACK} ..."
rm -rf "packs/${PACK}"
npx --yes @foundryvtt/foundryvtt-cli@latest package pack \
  --id the-laundry --type System \
  -n "${PACK}" \
  --in "src/packs/${PACK}" \
  --out packs

echo "Done. packs/${PACK} rebuilt."
