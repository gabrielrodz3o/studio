#!/bin/zsh
cd "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  for studio_node in "$HOME"/.nvm/versions/node/*/bin; do
    [[ -x "$studio_node/node" ]] && export PATH="$studio_node:$PATH"
  done
fi
export PATH="/opt/homebrew/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo 'No se encontró Node.js.'
  read
  exit 1
fi
if curl -fsS http://127.0.0.1:4173/login >/dev/null 2>&1; then
  open http://127.0.0.1:4173/centro.html
  exit 0
fi
node local.mjs &
studio_pid=$!
trap 'kill "$studio_pid" 2>/dev/null' EXIT INT TERM
for studio_try in {1..40}; do
  if curl -fsS http://127.0.0.1:4173/login >/dev/null 2>&1; then
    open http://127.0.0.1:4173/centro.html
    break
  fi
  sleep 0.2
done
wait "$studio_pid"
