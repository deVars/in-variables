#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc --out-dir ./dist --delete-dir-on-start

ln -s "${PWD}/index.html" ./dist/index.html
ln -s "${PWD}/index.css" ./dist/index.css
ln -s "${PWD}/3p" ./dist/3p
ln -s "${PWD}/assets" ./dist/assets
ln -s "${PWD}/static" ./dist/static
