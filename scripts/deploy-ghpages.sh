#!/usr/bin/env bash
# Rebuild the static export and deploy it to GitHub Pages (gh-pages branch).
# Live at: https://logan196.github.io/artemislabs-site/
# When artemislabs.bio is bought: echo "artemislabs.bio" > CNAME in the deploy
# dir below (before commit), and point Porkbun DNS at GitHub Pages
# (A 185.199.108.153 / .109 / .110 / .111, plus www CNAME -> logan196.github.io).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
DEPLOY=$(mktemp -d)
cp -R out/. "$DEPLOY"/
touch "$DEPLOY/.nojekyll"
# [ -n "${ARTEMIS_DOMAIN:-}" ] && echo "$ARTEMIS_DOMAIN" > "$DEPLOY/CNAME"
cd "$DEPLOY"
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Deploy Artemis Labs launch site"
git push -q --force https://github.com/logan196/artemislabs-site.git gh-pages
cd / && rm -rf "$DEPLOY"
echo "deployed -> https://logan196.github.io/artemislabs-site/"
