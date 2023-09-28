#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc --out-dir ./dist --delete-dir-on-start

ln -s "${PWD}/index.html" ./dist/index.html
ln -s "${PWD}/index.css" ./dist/index.css
cp -r "${PWD}/3p" ./dist/3p
cp -r "${PWD}/assets" ./dist/assets
cp -r "${PWD}/static" ./dist/static
