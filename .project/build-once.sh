#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc --out-dir ./dist --delete-dir-on-start

cp "${PWD}/index.html" ./dist/index.html
cp "${PWD}/index.css" ./dist/index.css
cp -r "${PWD}/3p" ./dist/3p
cp -r "${PWD}/assets" ./dist/assets
cp -r "${PWD}/static" ./dist/static
