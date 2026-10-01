#!/bin/sh
# Run as the Studio server operator after uploading releases/studio-20261001.tar.gz.
set -eu
cd /root/gcode-studio
release=studio-20261001
python3 - <<'PY'
import json
from pathlib import Path
for p in Path('data/state/jobs').glob('job_*/job.json'):
 if json.loads(p.read_text()).get('status') in ('running','queued'):raise SystemExit('Production active: defer deployment')
PY
docker image tag gcode-studio:local gcode-studio:before-action-plan-20261001
tar -xzf "releases/$release.tar.gz" -C app
docker build -t gcode-studio:local app
cp data/state/marketing/state.json private/marketing-before-action-plan.json
if test -f data/state/api-clients.json; then cp data/state/api-clients.json private/api-clients-before-action-plan.json; fi
docker compose -f deploy/compose.yaml stop -t 120 studio
python3 - <<'PY'
import json,os,datetime
from pathlib import Path
config=json.loads(Path('private/action-plan-config.json').read_text());state=Path('data/state/marketing/state.json');data=json.loads(state.read_text());data['accounts']=config['accounts'];data.setdefault('releases',[])
campaign=config['campaign'];stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();campaign.update(created_at=stamp,updated_at=stamp)
if not any(c['id']==campaign['id'] for c in data['campaigns']):data['campaigns'].append(campaign)
for path,value in [(state,data),(Path('data/state/api-clients.json'),config['api_clients'])]:
 temp=path.with_suffix('.deploy-tmp');temp.write_text(json.dumps(value));temp.chmod(0o600);os.chown(temp,1000,1000);temp.replace(path)
PY
docker compose -f deploy/compose.yaml up -d --no-build --force-recreate studio
healthy=0
for n in 1 2 3 4 5 6 7 8 9 10 11 12; do
 if docker exec gcode-studio node -e "fetch('http://127.0.0.1:4173/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then healthy=1; break; fi
 sleep 2
done
if test "$healthy" != 1; then
 docker compose -f deploy/compose.yaml stop studio
 cp private/marketing-before-action-plan.json data/state/marketing/state.json
 chown 1000:1000 data/state/marketing/state.json
 if test -f private/api-clients-before-action-plan.json; then cp private/api-clients-before-action-plan.json data/state/api-clients.json; else rm -f data/state/api-clients.json; fi
 docker image tag gcode-studio:before-action-plan-20261001 gcode-studio:local
 docker compose -f deploy/compose.yaml up -d --no-build --force-recreate studio
 echo 'Deployment failed; previous image and configuration restored.'
 exit 1
fi
echo 'Studio deployed; login responds. Human approvals preserved.'
