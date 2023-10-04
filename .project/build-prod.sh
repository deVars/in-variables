#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc-prod --out-dir ./dist --delete-dir-on-start
pnpm exec lightningcss --bundle --minify --output-file ./dist/index.css ./index.css

cp "${PWD}/index.html" ./dist/index.html
cp "${PWD}/favicon.ico" ./dist/favicon.ico
cp -r "${PWD}/3p" ./dist/3p
cp -r "${PWD}/assets" ./dist/assets
cp -r "${PWD}/static" ./dist/static
