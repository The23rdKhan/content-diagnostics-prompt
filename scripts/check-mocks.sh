#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

search() {
  local pattern="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -n "$pattern" . --glob '!scripts/check-mocks.sh'
  else
    grep -RIn --exclude="check-mocks.sh" -- "$pattern" .
  fi
}

if search "mockReports|mockJobs|mockTasks|mockAdmin"; then
  echo "Mock data identifiers found. Remove them before merging."
  exit 1
fi

if search "from ['\"][^'\"]*-data['\"]|require\\(['\"][^'\"]*-data['\"]\\)"; then
  echo "Imports from *-data.ts found. Remove mock data dependencies."
  exit 1
fi
