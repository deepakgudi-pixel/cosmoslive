#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  export FRONTEND_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  export NEXT_PUBLIC_API_URL="https://${CODESPACE_NAME}-4000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

  echo "Codespaces frontend: ${FRONTEND_URL}"
  echo "Codespaces API:      ${NEXT_PUBLIC_API_URL}"
else
  export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}"

  echo "Local frontend: ${FRONTEND_URL}"
  echo "Local API:      ${NEXT_PUBLIC_API_URL}"
fi

npm run dev
