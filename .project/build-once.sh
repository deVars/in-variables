#! /usr/bin/env bash

pnpm exec swc ./src --config-file ./.swcrc --out-dir ./dist ./src --delete-dir-on-start

ln -s "${PWD}/index.html" ./dist/index.html
ln -s "${PWD}/index.css" ./dist/index.css
ln -s "${PWD}/assets" ./dist/assets
ln -s "${PWD}/src/route.yaml" ./dist/route.yaml
ln -s "${PWD}/src/skills.yaml" ./dist/skills.yaml
