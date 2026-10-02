#!/usr/bin/env python3
"""Provision only Studio's read/sync integration credential; no Meta/TikTok token.
Run from the operator workstation with authorized SSH to gcoderd1/gcoderd2.
The raw token stays inside n8n's private volume. Only its SHA-256 crosses hosts.
"""
import subprocess, shlex, json
node = r'''
const fs=require('fs'),crypto=require('crypto');
const dir='/home/node/.n8n/gcode-studio-integration/v2';fs.mkdirSync(dir,{recursive:true,mode:0o700});
const file=dir+'/ads-token';if(!fs.existsSync(file))fs.writeFileSync(file,crypto.randomBytes(32).toString('hex')+'\n',{mode:0o600,flag:'wx'});
const token=fs.readFileSync(file,'utf8').trim();if(token.length<32)throw Error('Invalid integration credential');
fs.chmodSync(file,0o600);fs.chownSync(file,1000,1000);
process.stdout.write(crypto.createHash('sha256').update(token).digest('hex'));
'''
remote = 'docker exec n8n node -e '+shlex.quote(node)
result=subprocess.run(['ssh','gcoderd1',remote],capture_output=True,text=True)
if result.returncode:raise SystemExit('No se pudo preparar la credencial privada n8n (detalle omitido).')
digest=result.stdout.strip()
if len(digest)!=64 or any(c not in '0123456789abcdef' for c in digest):raise SystemExit('Respuesta inválida; no se modificó Studio.')
script = r'''
import sys,json,pathlib,os,shutil,datetime
p=pathlib.Path('/root/gcode-studio/data/state/api-clients.json')
digest=sys.stdin.read().strip()
assert len(digest)==64 and all(c in '0123456789abcdef' for c in digest)
d=json.loads(p.read_text()) if p.exists() else {'legacy_scopes':['read','produce','publish','metrics','import','automation'],'clients':[]}
backup=p.with_name('api-clients.before-ads-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.json')
if p.exists():shutil.copy2(p,backup)
client={'id':'studio-ads-reader','sha256':digest,'scopes':['ads.read','ads.sync'],'ad_connections':[],'automated_ads_sync':True}
d['clients']=[c for c in d.get('clients',[]) if c.get('id')!=client['id']]+[client]
tmp=p.with_suffix('.ads.tmp');tmp.write_text(json.dumps(d));os.chmod(tmp,0o600)
if p.exists():st=p.stat();os.chown(tmp,st.st_uid,st.st_gid)
else:os.chown(tmp,1000,1000)
os.replace(tmp,p)
print('Cliente Ads de lectura configurado; necesita reinicio de Studio para cargarse.')
'''
result=subprocess.run(['ssh','gcoderd2','python3 -c '+shlex.quote(script)],input=digest,capture_output=True,text=True)
if result.returncode:raise SystemExit('No se pudo registrar el hash de la credencial en Studio (detalle omitido).')
print(result.stdout.strip())
