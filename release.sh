#!/usr/bin/env bash
# One-command release: bump the version in system.json, commit, tag, and push.
# The GitHub Action then builds the zip and publishes the release, after which
# you click "Update" in Foundry.
#
#   ./release.sh 0.1.1
#
set -euo pipefail

NEW="${1:-}"
if [ -z "$NEW" ]; then
  echo "usage: ./release.sh <version>   e.g. ./release.sh 0.1.1" >&2
  exit 1
fi

# Update the version field (order-preserving) without needing jq installed.
python3 - "$NEW" <<'PY'
import json, sys
version = sys.argv[1]
with open("system.json") as f:
    data = json.load(f)
data["version"] = version
with open("system.json", "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY

git add system.json
git commit -m "Release v${NEW}"
git tag "v${NEW}"
git push origin HEAD
git push origin "v${NEW}"

echo
echo "Pushed v${NEW}. GitHub Actions is now building the release."
echo "When it finishes, open Foundry and click 'Update' on The Laundry system."
