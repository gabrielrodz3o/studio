// Run inside n8n only after HTTPS and the Studio login have been verified.
const fs=require('fs');
(async()=>{
 const dir='/home/node/.n8n/gcode-studio-integration';
 const info=JSON.parse(fs.readFileSync(dir+'/installed.json'));
 if(info.workflow_id!=='sn74WWUHBFoW6pqS')throw Error('Workflow inesperado; no modificar.');
 const base='https://studio.gcoderd.com';
 const token=fs.readFileSync(dir+'/studio-token','utf8').trim();
 const health=await fetch(base+'/api/v1/health',{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!health.ok||(await health.json()).ok!==true)throw Error('El endpoint HTTPS autenticado todavía no está listo.');
 const key=fs.readFileSync('/home/node/.n8n/tl/v8-secrets/api-key','utf8').trim();
 const api=async(path,method='GET',body)=>{
  const r=await fetch('http://127.0.0.1:5678/api/v1'+path,{method,headers:{'X-N8N-API-KEY':key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error('n8n HTTP '+r.status);
  return r.json();
 };
 const id=info.workflow_id,w=await api('/workflows/'+id);
 fs.writeFileSync(dir+'/before-domain-'+Date.now()+'.json',JSON.stringify(w),{mode:0o600});
 const nodes=JSON.parse(JSON.stringify(w.nodes).replaceAll('http://10.108.0.3:4173',base));
 if(JSON.stringify(nodes).includes('http://172.17.0.1:4177'))throw Error('Quedó una dirección temporal de prueba.');
 if(!JSON.stringify(nodes).includes(base))throw Error('No se encontró la dirección de Studio.');
 if(w.active)await api('/workflows/'+id+'/deactivate','POST');
 await api('/workflows/'+id,'PUT',{name:w.name,nodes,connections:w.connections,settings:{executionOrder:'v1',timezone:'America/Santo_Domingo',executionTimeout:2100,callerPolicy:'workflowsFromSameOwner'}});
 await api('/workflows/'+id+'/activate','POST');
 Object.assign(info,{active:true,connection:'authenticated_https',base_url:base,domain_enabled_at:new Date().toISOString()});
 fs.writeFileSync(dir+'/installed.json',JSON.stringify(info),{mode:0o600});
 console.log(JSON.stringify({workflow_id:id,active:true,base_url:base,publishes:false}));
})().catch(e=>{console.error(e.message);process.exit(1)});
