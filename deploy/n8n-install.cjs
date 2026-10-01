// Ejecutar dentro del contenedor n8n. Solo crea la integración propia de Studio.
const fs=require('fs'),crypto=require('crypto');
(async()=>{
 const dir='/home/node/.n8n/gcode-studio-integration';fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const key=fs.readFileSync('/home/node/.n8n/tl/v8-secrets/api-key','utf8').trim(),token=fs.readFileSync(dir+'/studio-token','utf8').trim();
 const api=async(p,method='GET',body)=>{const r=await fetch('http://127.0.0.1:5678/api/v1'+p,{method,headers:{'X-N8N-API-KEY':key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('n8n '+r.status+' '+(await r.text()).slice(0,180));return r.json()};
 if(fs.existsSync(dir+'/installed.json')){console.log('Integración ya instalada:',JSON.parse(fs.readFileSync(dir+'/installed.json')).workflow_id);return}
 const outbound=await api('/credentials','POST',{name:'GCODE Studio API privada',type:'httpHeaderAuth',data:{name:'Authorization',value:'Bearer '+token}});
 const inboundSecret=crypto.randomBytes(32).toString('hex');fs.writeFileSync(dir+'/webhook-token',inboundSecret,{mode:0o600});
 const inbound=await api('/credentials','POST',{name:'GCODE Studio entrada privada',type:'httpHeaderAuth',data:{name:'X-GCODE-Studio-Key',value:inboundSecret}});
 const node=(name,type,parameters,x,y=0,extra={})=>({id:crypto.randomUUID(),name,type,typeVersion:({webhook:2,respondToWebhook:1.4,httpRequest:4.2,code:2,wait:1.1,if:2.2,executeWorkflowTrigger:1.1}[type]||1),position:[x,y],parameters,...extra,type:'n8n-nodes-base.'+type});
 const credential={httpHeaderAuth:{id:outbound.id,name:outbound.name}};
 const nodes=[
 node('Solicitud autenticada','webhook',{httpMethod:'POST',path:'gcode-studio-producir-v1',authentication:'headerAuth',responseMode:'responseNode',options:{}},0,0,{webhookId:crypto.randomUUID(),credentials:{httpHeaderAuth:{id:inbound.id,name:inbound.name}}}),
 node('Desde otro workflow','executeWorkflowTrigger',{inputSource:'passthrough'},0,220),
 node('Preparar solicitud','code',{jsCode:"const x=$json.body||$json;if(!x.request||typeof x.idempotency_key!=='string')throw Error('Se requiere request e idempotency_key');return [{json:{base_url:'https://studio.gcoderd.com',respond_webhook:!!$json.headers,request:x.request,idempotency_key:x.idempotency_key,started_at:Date.now()}}];"},220),
 node('Solicitar pieza','httpRequest',{authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',method:'POST',url:"={{ $json.base_url + '/api/v1/jobs' }}",sendHeaders:true,headerParameters:{parameters:[{name:'Idempotency-Key',value:'={{ $json.idempotency_key }}'}]},sendBody:true,specifyBody:'json',jsonBody:'={{ JSON.stringify($json.request) }}',options:{timeout:30000}},440,0,{credentials:credential,retryOnFail:true,maxTries:3,waitBetweenTries:1500}),
 node('Responder ID','respondToWebhook',{respondWith:'json',responseBody:'={{ $json }}',options:{responseCode:202}},660),
 node('Esperar','wait',{amount:10,unit:'seconds'},880),
 node('Consultar trabajo','httpRequest',{authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',url:"={{ $('Preparar solicitud').first().json.base_url + $('Solicitar pieza').first().json.job.status_url }}",options:{timeout:30000}},1100,0,{credentials:credential}),
 node('Listo','if',{conditions:{options:{caseSensitive:true,leftValue:'',typeValidation:'strict',version:2},conditions:[{id:crypto.randomUUID(),leftValue:'={{ $json.status }}',rightValue:'succeeded',operator:{type:'string',operation:'equals'}}],combinator:'and'},options:{}},1320),
 node('Separar archivos','code',{jsCode:"const j=$json;const files=j.kind==='video'?[{url:j.artifact.video_url,index:1}]:j.artifact.images;return files.map(p=>({json:{job_id:j.id,kind:j.kind,review:j.review,caption:j.artifact.caption||'',index:p.index,url:'https://studio.gcoderd.com'+p.url,requires_approval:j.review.status!=='approved'},pairedItem:{item:0}}));"},1540,-100),
 node('Descargar borrador','httpRequest',{authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',url:'={{ $json.url }}',options:{timeout:120000,response:{response:{responseFormat:'file',outputPropertyName:'media'}}}},1760,-100,{credentials:credential}),
 node('Revisar estado','code',{jsCode:"if(!['queued','running'].includes($json.status))throw Error($json.error||$json.status);if(Date.now()-$('Preparar solicitud').first().json.started_at>30*60000)throw Error('Plazo agotado; consultar el mismo ID, no crear otro');return $input.all();"},1540,160)
 ];
 nodes.push(node('Responder al webhook','if',{conditions:{options:{caseSensitive:true,leftValue:'',typeValidation:'strict',version:2},conditions:[{id:crypto.randomUUID(),leftValue:"={{ $('Preparar solicitud').first().json.respond_webhook }}",rightValue:true,operator:{type:'boolean',operation:'true',singleValue:true}}],combinator:'and'},options:{}},660,180));
 const connections={};const link=(a,b,branch=0)=>{connections[a]??={main:[]};connections[a].main[branch]??=[];connections[a].main[branch].push({node:b,type:'main',index:0})};
 for(const [a,b]of[['Solicitud autenticada','Preparar solicitud'],['Desde otro workflow','Preparar solicitud'],['Preparar solicitud','Solicitar pieza'],['Solicitar pieza','Responder al webhook'],['Responder al webhook','Responder ID'],['Responder ID','Esperar'],['Esperar','Consultar trabajo'],['Consultar trabajo','Listo'],['Listo','Separar archivos'],['Separar archivos','Descargar borrador'],['Revisar estado','Esperar']])link(a,b);link('Listo','Revisar estado',1);link('Responder al webhook','Esperar',1);
 const workflow=await api('/workflows','POST',{name:'GCODE Studio - Producir multimedia privada',nodes,connections,settings:{executionOrder:'v1',timezone:'America/Santo_Domingo',executionTimeout:2100,callerPolicy:'workflowsFromSameOwner'}});
 await api('/workflows/'+workflow.id+'/activate','POST');fs.writeFileSync(dir+'/installed.json',JSON.stringify({workflow_id:workflow.id,credential_id:outbound.id,inbound_credential_id:inbound.id,installed_at:new Date().toISOString(),publicacion:false}),{mode:0o600});console.log(JSON.stringify({workflow_id:workflow.id,active:true,publishes:false}));
})().catch(e=>{console.error(e.message);process.exit(1)})
