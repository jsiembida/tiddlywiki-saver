#!/usr/bin/env bash

set -eu

TIDDLYWIKI_FILE="${1:-}"
if [[ -z "${TIDDLYWIKI_FILE}" ]]
then
  echo -e '\nProvide a path to the TiddlyWiki file you want to use.\n'
  exit 1
fi

TIDDLYWIKI_FILE="$(stat --format=%n "${TIDDLYWIKI_FILE}")"

mkdir -p "${HOME}/.local/share/applications/" "${HOME}/.local/share/icons/"
if [[ -f "${HOME}/.local/share/applications/tiddlywiki.desktop" ]]
then
  rm "${HOME}/.local/share/applications/tiddlywiki.desktop"
  update-desktop-database "${HOME}/.local/share/applications/"
fi

TIDDLYWIKI_FILE_URL="file://${TIDDLYWIKI_FILE}" \
TIDDLYWIKI_WINDOW_CLASS="$(echo "${TIDDLYWIKI_FILE}" | tr / _ | cut -c 2-)" \
  envsubst < ./tiddlywiki.desktop > "${HOME}/.local/share/applications/tiddlywiki.desktop"
cp ./icon.svg "${HOME}/.local/share/icons/tiddlywiki.svg"
update-desktop-database "${HOME}/.local/share/applications/"
