'use strict';
// n8n owns scheduling only. This credential must have ads.read + ads.sync, never write scopes.
const fs=require('node:fs'),path=require('node:path');
async function syncAds({base,token,fetchImpl=fetch,now=new Date(),recordAttempt=()=>{},lastAttempts={}}){
 async function api(route,body){const r=await fetchImpl(base+route,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(150000)});if(!r.ok)throw Error('Studio Ads HTTP '+r.status);return r.json()}
 const state=await api(''),c=state.connections.filter(c=>now-Date.parse(lastAttempts[c.id]||0)>=6*3600000).sort((a,b)=>String(lastAttempts[a.id]||'').localeCompare(String(lastAttempts[b.id]||'')))[0];
 if(!c)return {status:'idle',accounts:state.connections.length,writes:false};
 recordAttempt(c.id,now.toISOString());await api('/verify',{connection_id:c.id});const current=(await api('')).connections.find(x=>x.id===c.id);const today=new Intl.DateTimeFormat('en-CA',{timeZone:current.metadata.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now),end=new Date(today+'T00:00:00Z');end.setUTCDate(end.getUTCDate()-1);const start=new Date(end);start.setUTCDate(start.getUTCDate()-6);
 const result=await api('/sync',{connection_id:c.id,since:start.toISOString().slice(0,10),until:end.toISOString().slice(0,10)});return {status:'synced',connection_id:c.id,sync_id:result.id,complete:result.complete,writes:false};
}
module.exports={syncAds};
if(require.main===module)(async()=>{const dir='/home/node/.n8n/gcode-studio-integration/v2',token=fs.readFileSync(path.join(dir,'ads-token'),'utf8').trim(),file=path.join(dir,'ads-sync-attempts.json');let lastAttempts={};try{lastAttempts=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw Error('Registro de sincronización ilegible')}const result=await syncAds({base:'https://studio.gcoderd.com/api/v1/ads',token,lastAttempts,recordAttempt:(id,at)=>{lastAttempts[id]=at;const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(lastAttempts),{mode:0o600});fs.renameSync(tmp,file)}});console.log(JSON.stringify(result))})().catch(e=>{console.error(/^Studio Ads HTTP \d+$/.test(e.message)?e.message:'No se pudo sincronizar Ads; revisa la configuración privada');process.exitCode=1});
