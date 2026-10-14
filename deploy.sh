#!/usr/bin/env bash
# Deploy to a Synology NAS over SSH: the NAS cannot reach your git, so the
# sources go over as a tar stream and the image is built there.
#   NAS=user@host ./deploy.sh
#   NAS=user@host NAS_DIR=/volume1/docker/sk_storage ./deploy.sh
# Or keep NAS / NAS_DIR in .deploy.env next to this script (gitignored).
# First time on the NAS: create $NAS_DIR and put a .env there (.env.example).
# .env and data/ are never touched by this script. docker on DSM needs root:
# commands run through passwordless sudo (sudoers: NOPASSWD for
# /usr/local/bin/docker, /usr/local/bin/docker-compose, /bin/chown,
# /bin/chmod, /usr/syno/bin/synoacltool).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
[ -f "$here/.deploy.env" ] && . "$here/.deploy.env"
NAS="${NAS:?set NAS=user@host (env or .deploy.env)}"
NAS_DIR="${NAS_DIR:-/volume1/docker/sk_storage}"

# Tests first; nothing is sent if they fail.
(cd "$here" && npx vitest run --reporter=dot)

# tar over ssh rather than rsync (rsync on DSM is a stub unless the service
# is enabled). Everything except .env and data/ is replaced on the NAS.
ssh "$NAS" "mkdir -p '$NAS_DIR' '$NAS_DIR/data' && find '$NAS_DIR' -mindepth 1 -maxdepth 1 \
  ! -name .env ! -name data -exec rm -rf {} +"
entries=()
for e in "$here"/* "$here"/.[!.]*; do
  case "$(basename "$e")" in
    node_modules|dist|.git|data|.env|.deploy.env|.DS_Store) ;;
    *) entries+=("$(basename "$e")") ;;
  esac
done
COPYFILE_DISABLE=1 tar -C "$here" --no-xattrs --exclude .DS_Store \
  -czf - "${entries[@]}" | ssh "$NAS" "tar -C '$NAS_DIR' -xzf -"

# Container Manager installs docker into /usr/local/bin, which is not on
# sudo's PATH, hence absolute paths. data/ is a bind mount: docker on DSM
# does not create it and the container runs as uid 1000 (node).
# Build first, then `up -d`: a failed build leaves the old container running.
# `image prune -f` removes only dangling images (previous builds); avoid
# `docker system prune` / `docker system df` on low-memory DSM boxes, dockerd
# can get OOM-killed and take the containers down with it.
ssh "$NAS" "set -e; cd '$NAS_DIR' && [ -f .env ] || { echo 'no .env in $NAS_DIR (see .env.example)'; exit 1; }
  if [ -x /usr/local/bin/docker-compose ]; then C='sudo -n /usr/local/bin/docker-compose';
  elif [ -x /usr/local/bin/docker ]; then C='sudo -n /usr/local/bin/docker compose';
  else echo 'docker not found: install Container Manager from Package Center'; exit 1; fi
  # A fresh directory under the docker share inherits Synology ACLs (everyone
  # read-only) that override the POSIX bits, so the container got EACCES on
  # mkdir despite chown. Drop the ACL and let plain Linux permissions apply.
  sudo -n /usr/syno/bin/synoacltool -del '$NAS_DIR/data' >/dev/null 2>&1 || true
  sudo -n /bin/chown 1000:1000 '$NAS_DIR/data' && sudo -n /bin/chmod 755 '$NAS_DIR/data'
  \$C build || { echo 'build failed, old container keeps running'; \$C ps; exit 1; }
  # compose 2.20 on DSM once created the container and then failed with
  # \"name already in use\" on the very first deploy; a second up -d adopts it.
  (\$C up -d || \$C up -d) && \$C ps && \
  sudo -n /usr/local/bin/docker image prune -f && \
  sleep 3 && wget -qO- http://127.0.0.1:4323/healthz && echo"
