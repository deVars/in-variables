#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc-prod --out-dir ./dist --delete-dir-on-start
BROWSERSLIST=">= 0.25%, firefox esr, chrome > 85" pnpm exec lightningcss --browserslist --bundle --minify --output-file ./dist/index.css ./index.css

cp "${PWD}/index.html" ./dist/index.html
cp "${PWD}/friconix.min.css" ./dist/friconix.min.css
cp "${PWD}/favicon.ico" ./dist/favicon.ico
cp -r "${PWD}/assets" ./dist/assets
cp -r "${PWD}/static" ./dist/static
