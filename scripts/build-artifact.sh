#!/usr/bin/env bash
# Build the static export and derive the artifact-publishable copy:
#  * _next/ -> next-assets/  (underscore prefix is reserved on the artifact host)
#  * rewrite _next/ path references in html/js/css
#  * replace literal U+FFFD chars in js chunks with � escapes (host rejects them)
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
rm -rf out-artifact
cp -R out out-artifact
mv out-artifact/_next out-artifact/next-assets
grep -rl "_next/" out-artifact --include="*.html" --include="*.js" --include="*.css" \
  | while read -r f; do sed -i '' 's|_next/|next-assets/|g' "$f"; done
python3 - <<'EOF'
from pathlib import Path
for p in Path("out-artifact").rglob("*.js"):
    s = p.read_text(encoding="utf-8")
    if "�" in s:
        p.write_text(s.replace("�", "\\uFFFD"), encoding="utf-8")
        print(f"sanitized {p}")
EOF
echo "out-artifact/ ready"
