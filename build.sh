#!/usr/bin/env bash

set -eu

BROWSER="${1:-}"
if [[ "${BROWSER}" != "chrome" && "${BROWSER}" != "firefox" ]]
then
  echo -e '\nProvide "chrome" or "firefox" as a build parameter.\n'
  exit 1
fi

BUILD="build/${BROWSER}"

rm -rf "${BUILD}"
mkdir -p "${BUILD}"

cp icon*.png options.html options.css "${BUILD}/"
cp "${BROWSER}-manifest.json" "${BUILD}/manifest.json"
sed "/\/\* include browser-background\.js \*\// r ${BROWSER}-background.js" < background.js > "${BUILD}/background.js"
sed "/\/\* include browser-content\.js \*\// r ${BROWSER}-content.js" < content.js > "${BUILD}/content.js"
sed "/\/\* include browser-options\.js \*\// r ${BROWSER}-options.js" < options.js > "${BUILD}/options.js"

zip -q -j "${BUILD}.zip" "${BUILD}/"*
echo -e "\nExtension ${BUILD}/ zipped as ${BUILD}.zip\n"
