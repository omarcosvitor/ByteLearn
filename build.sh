#!/usr/bin/env bash
# Concatena parts/*.html em index.html e sincroniza a versao do cache do service worker
# com um hash do conteudo gerado, para que toda mudanca real invalide o cache antigo sozinha.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PARTS_DIR="parts"
OUT="index.html"
SW="sw.js"

cat \
  "$PARTS_DIR/01-head.html" \
  "$PARTS_DIR/02-styles.html" \
  "$PARTS_DIR/03-header.html" \
  "$PARTS_DIR/04-main.html" \
  "$PARTS_DIR/05-footer.html" \
  "$PARTS_DIR/06-scripts.html" \
  > "$OUT"

HASH=$(sha256sum "$OUT" | cut -c1-10)

sed -i.bak -E "s/const CACHE_VERSION = \"[^\"]*\";/const CACHE_VERSION = \"$HASH\";/" "$SW"
rm -f "$SW.bak"

echo "build ok: $OUT gerado, cache version = $HASH"
