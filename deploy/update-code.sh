#!/bin/sh
# Code-only update. Preserve all private state, credentials, assets and publication history.
# Usage on gcoderd2: sh app/deploy/update-code.sh releases/studio-<version>.tar.gz
set -eu
cd /root/gcode-studio
archive=${1:?Provide release archive relative to /root/gcode-studio}
test -f "$archive"
python3 - <<'PY'
import json
from pathlib import Path
for p in Path('data/state/jobs').glob('job_*/job.json'):
 if json.loads(p.read_text()).get('status') in ('running','queued'):
  raise SystemExit('Active production; deploy after the queue drains.')
PY
stamp=$(date -u +%Y%m%dT%H%M%SZ)
previous="gcode-studio:before-$stamp"
docker image tag gcode-studio:local "$previous"
mkdir -p backups
tar -czf "backups/code-$stamp.tar.gz" -C app --exclude=node_modules --exclude=.git --exclude=.studio-state --exclude=voz --exclude=assets --exclude=feed/brand --exclude=feed/photos .
tar -xzf "$archive" -C app
if ! docker build -t gcode-studio:local app; then
 echo 'Build failed. Running service was not changed.'
 exit 1
fi
docker compose -f deploy/compose.yaml up -d --no-build --force-recreate studio
for n in 1 2 3 4 5 6 7 8 9 10 11 12; do
 if docker exec gcode-studio node -e "fetch('http://127.0.0.1:4173/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
  echo "Code update healthy; rollback image: $previous"
  exit 0
 fi
 sleep 2
done
docker image tag "$previous" gcode-studio:local
docker compose -f deploy/compose.yaml up -d --no-build --force-recreate studio
echo 'Health failed; previous image restored. Private data retained.'
exit 1
