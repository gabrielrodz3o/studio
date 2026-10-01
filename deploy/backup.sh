#!/bin/sh
set -eu
cd /root/gcode-studio
mkdir -p backups
chmod 700 backups
if ! python3 - <<'PY'
import json
from pathlib import Path
active=any(json.loads(p.read_text()).get('status') in ('running','queued') for p in Path('data/state/jobs').glob('job_*/job.json'))
active |= any(json.loads(p.read_text()).get('status') in ('creating','generating','reviewing') for p in Path('data/state/photos').glob('photo_*.json'))
raise SystemExit(1 if active else 0)
PY
then
  echo 'Respaldo aplazado: hay producción activa.'
  exit 0
fi
file="backups/studio-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
# Stop writes during the snapshot; restart even if archiving fails.
trap 'docker compose -f deploy/compose.yaml start studio >/dev/null' EXIT
docker compose -f deploy/compose.yaml stop -t 120 studio >/dev/null
tar --exclude=app/node_modules --exclude=app/.studio-state --exclude=app/salida \
  --exclude=app/referencias --exclude=app/models --exclude=app/voz \
  -czf "$file" app data/state data/storyboards data/feed data/voice private deploy
chmod 600 "$file"
# Keep the most recent 7 daily backups, including paid voice files.
python3 - <<'PY'
from pathlib import Path
for p in sorted(Path('backups').glob('studio-*.tar.gz'),reverse=True)[7:]:p.unlink()
PY
