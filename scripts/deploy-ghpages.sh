#!/usr/bin/env bash
# Publish the static export onto the gh-pages branch.
# Preserves /live, /figures, and CNAME from the current gh-pages tip.
# Does not push unless DEPLOY_PUSH=1. Logan reviews before that.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

if [[ "${DEPLOY_PUSH:-}" != "1" ]]; then
  cat <<'EOF'
Build is in ./out. Nothing was pushed.

When Logan approves, publish with:
  DEPLOY_PUSH=1 bash scripts/deploy-ghpages.sh

That command:
  1. Rebuilds the static export (npm run build -> ./out).
  2. Checks out origin/gh-pages in a temporary worktree.
  3. Refuses to continue if /live, /figures, or CNAME is missing there.
  4. Replaces the site files with ./out.
  5. Puts the saved /live, /figures, and CNAME back, and keeps .nojekyll.
  6. Commits and pushes only that gh-pages branch.
EOF
  exit 0
fi

WORKDIR=$(mktemp -d)
git fetch origin gh-pages
git worktree add --detach "$WORKDIR" origin/gh-pages
cleanup() { git worktree remove --force "$WORKDIR" >/dev/null 2>&1 || rm -rf "$WORKDIR"; }
trap cleanup EXIT

if [[ ! -d "$WORKDIR/live" || ! -d "$WORKDIR/figures" || ! -f "$WORKDIR/CNAME" ]]; then
  echo "Refusing to deploy: gh-pages is missing /live, /figures, or CNAME." >&2
  exit 1
fi

PRESERVE=$(mktemp -d)
cp -a "$WORKDIR/live" "$PRESERVE/live"
cp -a "$WORKDIR/figures" "$PRESERVE/figures"
cp "$WORKDIR/CNAME" "$PRESERVE/CNAME"
if [[ -f "$WORKDIR/.nojekyll" ]]; then cp "$WORKDIR/.nojekyll" "$PRESERVE/.nojekyll"; fi

find "$WORKDIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a out/. "$WORKDIR/"
rm -rf "$WORKDIR/live" "$WORKDIR/figures"
cp -a "$PRESERVE/live" "$WORKDIR/live"
cp -a "$PRESERVE/figures" "$WORKDIR/figures"
cp "$PRESERVE/CNAME" "$WORKDIR/CNAME"
touch "$WORKDIR/.nojekyll"

git -C "$WORKDIR" add -A
git -C "$WORKDIR" commit -m "Deploy premium redesign; preserve /live, /figures, and CNAME"
git -C "$WORKDIR" push origin HEAD:gh-pages
echo "Pushed gh-pages. https://artemislabs.bio"
