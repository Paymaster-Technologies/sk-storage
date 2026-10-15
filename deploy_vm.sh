#!/usr/bin/env bash
# Update a Linux VM that runs this repo from a git checkout. Meant to be
# called by a deploy hook (GitLab webhook -> builder -> this script over
# ssh) or by hand:
#   ./deploy_vm.sh                 # pull, rebuild, restart, health check
#   WITH_TEST=1 ./deploy_vm.sh     # also the storage-test service (profile `test`)
# Prerequisites, once: docker + compose plugin, this repo cloned, .env next
# to docker-compose.yml (template .env.example; for the test service
# .env.test, template .env.test.example). data/ and the .env files are never
# touched here. The caller needs rights to run docker (group `docker`, or
# run the script with sudo).
set -euo pipefail
cd "$(cd "$(dirname "$0")" && pwd)"

[ -f .env ] || { echo "no .env here (copy .env.example)"; exit 1; }
profiles=()
if [ "${WITH_TEST:-0}" = 1 ]; then
  [ -f .env.test ] || { echo "WITH_TEST=1 but no .env.test (copy .env.test.example)"; exit 1; }
  profiles=(--profile test)
fi

# Only fast-forward: a VM checkout must never carry local commits.
git fetch --quiet origin
git merge --ff-only --quiet "origin/$(git rev-parse --abbrev-ref HEAD)"
echo "at $(git rev-parse --short HEAD): $(git log -1 --format=%s)"

# Build first, then `up -d`: a failed build leaves the old container running.
docker compose "${profiles[@]}" build
docker compose "${profiles[@]}" up -d
docker compose "${profiles[@]}" ps
docker image prune -f >/dev/null

sleep 3
curl -fsS http://127.0.0.1:4323/healthz && echo
if [ "${WITH_TEST:-0}" = 1 ]; then
  curl -fsS http://127.0.0.1:4324/healthz && echo
fi
