#!/usr/bin/env bash
set -euo pipefail

for example in examples/*.js; do
  echo "Running $example"
  bun "$example" >/dev/null
done
