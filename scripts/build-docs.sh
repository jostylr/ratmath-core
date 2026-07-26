#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
package_dir="$(cd "$script_dir/.." && pwd)"

if ! command -v quarto >/dev/null 2>&1; then
  echo "Quarto is required to build the documentation: https://quarto.org/docs/get-started/" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required to copy the rendered site into docs/" >&2
  exit 1
fi

cd "$package_dir"
quarto render documentation
mkdir -p docs
rsync --archive --delete documentation/_site/ docs/

echo "Rendered documentation to $package_dir/docs"
