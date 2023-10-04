#! /usr/bin/env bash

if [ -d ./dist ] ; then
  rm -r dist
fi

mkdir ./dist

ln -s "${PWD}/index.html" ./dist/index.html
ln -s "${PWD}/index.css" ./dist/index.css
ln -s "${PWD}/favicon.ico" ./dist/favicon.ico
ln -s "${PWD}/3p" ./dist/3p
ln -s "${PWD}/assets" ./dist/assets
ln -s "${PWD}/static" ./dist/static
ln -s "${PWD}/styles" ./dist/styles

pnpm exec swc ./src --config-file ./.swcrc --out-dir ./dist --watch ./src

