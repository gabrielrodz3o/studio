"""Run on gcoderd2 after routing studio.gcoderd.com to http://127.0.0.1:4173."""
from pathlib import Path
import datetime
import json
import shutil
import subprocess

base = Path('/root/gcode-studio')
for path in (base / 'data/state/jobs').glob('job_*/job.json'):
    if json.loads(path.read_text())['status'] in ('queued', 'running'):
        raise SystemExit('Hay producción activa; esperar antes de cambiar el origen.')
env = base / 'private/studio.env'
lines = env.read_text().splitlines()
assert sum(line.startswith('STUDIO_ORIGIN=') for line in lines) == 1
target = 'STUDIO_ORIGIN=https://studio.gcoderd.com'
if target not in lines:
    backup = base / 'backups' / ('domain-env-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
    backup.mkdir(mode=0o700)
    shutil.copy2(env, backup / 'studio.env')
    env.write_text('\n'.join(target if line.startswith('STUDIO_ORIGIN=') else line for line in lines) + '\n')
    env.chmod(0o600)
    subprocess.run(['docker', 'compose', '-f', str(base / 'deploy/compose.yaml'), 'up', '-d'], check=True)
print('Origen HTTPS configurado; comprobar login y cookies en el subdominio.')
