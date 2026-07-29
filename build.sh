#!/usr/bin/env bash
# Assembles the deployable site into dist/ for Cloudflare Pages.
# Keeps README.md, DEPLOY.md, the .dc.html prototype and .htaccess in the repo
# but OUT of the public deploy. No dependencies — just file copies.
set -euo pipefail

rm -rf dist
mkdir -p dist

cp index.html 404.html styles.css main.js robots.txt sitemap.xml _headers dist/
cp -r assets dist/

echo "Built dist/ with $(find dist -type f | wc -l) files."
