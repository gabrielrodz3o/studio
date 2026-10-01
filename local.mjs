import {Automation} from './automation.mjs'
import {voiceTakes,perfil as voiceProfile} from './voz.mjs'
import {voiceReviews,reviewFile,acceptVoiceReview} from './voice-reviews.mjs'
import {createHandoff} from './handoff.mjs'
import {Batches,batchQuote} from './batches.mjs'
import {inspectCache,cleanCache,protectedCacheKeys} from './storage.mjs'
import {capability} from './capabilities.mjs'
import {authorizeApi} from './api-scopes.mjs'
import {campaignContext,proposals,deriveCampaign} from './planning.mjs'
import { createServer } from 'node:http'
import { createReadStream, readFileSync, unlinkSync } from 'node:fs'
import { readFile, readdir, stat, writeFile, rename, mkdir, open, unlink } from 'node:fs/promises'
import { dirname, resolve, extname, basename, sep, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID, createHash, timingSafeEqual } from 'node:crypto'
import { validar } from './validar.mjs'
import { Access, loginPage } from './access.mjs'
import {publicationsFor} from './history.mjs'
import { Marketing } from './marketing.mjs'
import { Versions } from './versions.mjs'
import { Creative } from './creative.mjs'
import { PhotoJobs } from './photo-jobs.mjs'
import { previewAudio } from './preview.mjs'
import { JobStore, problem } from './jobs.mjs'
import { feedCatalog, validateFeed, approvePhoto } from './feed.mjs'
let photoWrite=Promise.resolve()

const root = dirname(fileURLToPath(import.meta.url)), port = Number(process.env.STUDIO_PORT || 4173)
const state = resolve(root,'.studio-state')
await mkdir(state,{recursive:true,mode:0o700})
const origin=process.env.STUDIO_ORIGIN||`http://127.0.0.1:${port}`
const access=await new Access(state,{origin,enabled:process.env.STUDIO_REQUIRE_LOGIN!=='0'}).init()
const marketing=await new Marketing(root).init()
const versions=new Versions(root)
const creative=new Creative(root)
async function createPiece(input,key,actor){
 if(input.piece_id){const p=marketing.data.pieces.find(p=>p.id===input.piece_id);if(!p||p.brand_id!==(input.brand_id||'comandpos')||p.campaign_id!==input.campaign_id||p.kind!==input.kind)throw problem(422,'La pieza no corresponde a la marca, campaña o formato')}
 if(input.produce!=null&&typeof input.produce!=='boolean')throw problem(422,'produce debe ser booleano')
 if(input.aspect!=null&&!['vertical','horizontal','square','portrait'].includes(input.aspect))throw problem(422,'Formato de salida inválido')
 if(input.produce&&input.kind==='video'&&input.allow_paid_voice!==true)throw problem(422,'Autoriza la generación de voz para producir el video')
 const result=await creative.create(input,key,actor)
 await versions.save(result.kind,result.script,actor)
 if(!input.produce)return result
 const request={...(input.budget_group?{budget_group:input.budget_group}:{}),brand_id:input.brand_id||'comandpos',kind:result.kind,script:result.script,creative_id:result.id,concept_id:result.concept_id,caption:result.caption,...(result.campaign_id?{campaign_id:result.campaign_id}:{}),...(result.kind==='video'?{voice:true,subtitles:true,allow_paid_voice:true,aspect:input.aspect||'vertical',max_budget_usd:2}:{})}
 const {job}=await store.create(request,'idea-render:'+result.id,'creative')
 if(input.piece_id){const piece=marketing.data.pieces.find(p=>p.id===input.piece_id);if(!piece||piece.brand_id!==job.brand_id||piece.campaign_id!==result.campaign_id)throw problem(422,'La pieza no corresponde a esta campaña');await marketing.savePiece({...piece,job_id:job.id,caption:result.caption,creative_id:result.id},actor,store)}
 else if(actor!=='automation'&&result.campaign_id&&!marketing.data.pieces.some(p=>p.creative_id===result.id)){await marketing.savePiece({campaign_id:result.campaign_id,concept_id:result.concept_id,creative_id:result.id,title:result.selection?.topic?.slice(0,160)||result.script.nombre,kind:result.kind,channel:'instagram',caption:result.caption,brief:input.idea||result.selection?.idea||'',job_id:job.id},actor,store)}
 return {...result,job}
}
const photos=new PhotoJobs(root)
const lockFile=join(state,'service.lock')
async function lock(){
  try {const f=await open(lockFile,'wx',0o600);await f.writeFile(String(process.pid));await f.close()}
  catch(e){
    if(e.code!=='EEXIST')throw e
    const pid=Number(await readFile(lockFile,'utf8'))
    if(!Number.isInteger(pid)||pid<=0)throw Error('Bloqueo de servicio inválido; revisa .studio-state/service.lock')
    let alive=pid!==process.pid;try{if(alive)process.kill(pid,0)}catch(err){if(err.code==='ESRCH')alive=false}
    if(alive)throw Error(`Studio ya está ejecutándose (PID ${pid})`)
    await unlink(lockFile);await lock()
  }
}
await lock()
process.on('exit',()=>{try{if(Number(readFileSync(lockFile,'utf8'))===process.pid)unlinkSync(lockFile)}catch{}})
const tokenFile=join(state,'api-token')
let token=process.env.STUDIO_API_TOKEN
if(!token){try{token=(await readFile(tokenFile,'utf8')).trim()}catch(e){if(e.code!=='ENOENT')throw e;token=randomBytes(32).toString('hex');await writeFile(tokenFile,token+'\n',{mode:0o600,flag:'wx'})}}
if(token.length<32)throw Error('STUDIO_API_TOKEN debe tener al menos 32 caracteres')
let apiClients;try{apiClients=JSON.parse(await readFile(join(state,'api-clients.json'),'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
const store=await new JobStore({root,publications:id=>publicationsFor(marketing.data.deliveries,id)}).init()
const batches=await new Batches(root,{produce:createPiece,budget:creative.budget,store,linkJob:async(pieceId,jobId,actor)=>{const p=marketing.data.pieces.find(p=>p.id===pieceId);if(!p)throw problem(404,'Pieza no encontrada');await marketing.savePiece({...p,job_id:jobId},actor,store)}}).init();
const automation=await new Automation(root,{marketing,store,produce:createPiece}).init();
const mime={'.gz':'application/gzip','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf','.mp3':'audio/mpeg','.wav':'audio/wav','.mp4':'video/mp4'}
const digest=x=>createHash('sha256').update(x).digest()
function authenticated(req){return timingSafeEqual(digest(req.headers.authorization||''),digest('Bearer '+token))}
async function body(req,limit=250000){
  if(!req.headers['content-type']?.startsWith('application/json'))throw problem(415,'Se requiere application/json')
  const chunks=[];let bytes=0
  for await(const chunk of req){bytes+=chunk.length;if(bytes>limit)throw problem(413,'Solicitud demasiado grande');chunks.push(chunk)}
  try{return JSON.parse(Buffer.concat(chunks).toString())}catch{throw problem(400,'JSON inválido')}
}
async function catalog(){
  const config=JSON.parse(await readFile(join(root,'centro-config.json'),'utf8'))
  const templates=[]
  for(const file of (await readdir(join(root,'storyboards'))).filter(f=>!f.startsWith('.')&&f.endsWith('.json'))){
    const s=JSON.parse(await readFile(join(root,'storyboards',file),'utf8'))
    templates.push({id:file.slice(0,-5),name:s.nombre,format:s.formato||'historia',kind:'video',brand_id:s.brand_id||'comandpos',voice:s.voz===true,subtitles:s.subtitulos===true,seconds:s.escenas.reduce((n,e)=>n+e.dur,0)})
  }
  for(const file of (await readdir(join(root,'feed/templates'))).filter(f=>!f.startsWith('.')&&f.endsWith('.json'))){const s=JSON.parse(await readFile(join(root,'feed/templates',file),'utf8'));templates.push({id:file.slice(0,-5),name:s.nombre,kind:s.tipo,brand_id:s.brand_id||'comandpos',format:s.layout,pages:s.tipo==='carrusel'?(s.slides?.length||0):1})}
  return {api_version:1,center:config.nombre,brands:marketing.snapshot().brands,modules:config.modulos,templates}
}
async function sendFile(req,res,file){
  const s=await stat(file);if(!s.isFile())throw problem(404,'Archivo no encontrado')
  const headers={'Content-Type':mime[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Vary':'Cookie, Authorization'}
  let start=0,end=s.size-1,status=200
  if(req.headers.range){
    const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
    if(!m || (!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${s.size}`});return res.end()}
    if(!m[1])start=Math.max(0,s.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]))}
    if(start>end||start>=s.size){res.writeHead(416,{'Content-Range':`bytes */${s.size}`});return res.end()}
    status=206;headers['Content-Range']=`bytes ${start}-${end}/${s.size}`
  }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers)
  if(req.method==='HEAD')return res.end()
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res)
}
const server=createServer(async(req,res)=>{
  const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
  try{
    const url=new URL(req.url,'http://localhost'),path=url.pathname
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN')
    if(path==='/ui.css'&&req.method==='GET')return await sendFile(req,res,join(root,'ui.css'))
    if(path==='/login'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(loginPage)}
    if(path==='/auth/login'&&req.method==='POST'){const result=await access.login(req,await body(req));res.setHeader('Set-Cookie',result.cookie);return json(200,result.user)}
    if(path.startsWith('/api/v1/')){
      if(!authorizeApi(req.headers.authorization,path,req.method,token,apiClients))return json(401,{error:'Se requiere una clave de API válida'})
      if(req.headers.origin)throw problem(403,'La API de integración no acepta solicitudes de navegador; usa el editor')
      if(path==='/api/v1/automation'&&req.method==='GET')return json(200,automation.snapshot());
      if(path==='/api/v1/automation/tick'&&req.method==='POST'){const d=await body(req);return json(202,automation.kick({generate:d.generate!==false}))}
      if(path==='/api/v1/automation/config'&&req.method==='POST')return json(200,await automation.configure(await body(req),'n8n-automation'));
      if(path==='/api/v1/automation/recover'&&req.method==='POST'){const d=await body(req);return json(202,await automation.recover(d.id,{allowPaid:d.allow_paid===true}))}
      if(path==='/api/v1/publications/import'&&req.method==='POST')return json(200,await marketing.importPublication(await body(req),'n8n',store))
      const deliveryCheck=/^\/api\/v1\/deliveries\/([a-f0-9-]{36})\/verify$/.exec(path);if(deliveryCheck&&req.method==='GET')return json(200,marketing.validateDelivery(deliveryCheck[1],store))
      if(path==='/api/v1/marketing'&&req.method==='GET')return json(200,marketing.snapshot())
      if(path==='/api/v1/deliveries/claim'&&req.method==='POST')return json(200,await marketing.claim(await body(req),'n8n',store))
      if(path==='/api/v1/deliveries/result'&&req.method==='POST')return json(200,await marketing.result(await body(req),'n8n'))
      if(path==='/api/v1/metrics'&&req.method==='POST')return json(200,await marketing.addMetrics(await body(req),'n8n'))
      if(req.method==='POST'&&/^\/api\/v1\/photos\/photo_[a-f0-9-]{36}\/retry$/.test(path))return json(202,await photos.retry(path.split('/').at(-2)))
      if(req.method==='POST'&&path==='/api/v1/photos')return json(202,await photos.start(await body(req),req.headers['idempotency-key'],'n8n'))
      if(req.method==='GET'&&/^\/api\/v1\/photos\/photo_[a-f0-9-]{36}$/.test(path))return json(200,await photos.status(path.split('/').at(-1)))
      if(req.method==='POST'&&path==='/api/v1/ideas'){const result=await createPiece(await body(req),req.headers['idempotency-key'],'n8n');return json(200,result)}
      const action=/^\/api\/v1\/jobs\/(job_[a-f0-9-]{36})\/(cancel|retry|delivery|log)$/.exec(path)
      if(action){if(req.method==='POST'&&action[2]==='cancel')return json(200,await store.cancel(action[1]));if(req.method==='POST'&&action[2]==='retry')return json(202,await marketing.retryJob(action[1],req.headers['idempotency-key'],'n8n',store,url.searchParams.get('piece_id')));if(req.method==='GET'&&action[2]==='log')return json(200,{log:await store.log(action[1])});if(req.method==='GET'&&action[2]==='delivery'){const j=store.get(action[1]);if(j.review.status!=='approved')throw problem(409,'La pieza requiere aprobación');return json(200,j)}}
      if(req.method==='GET'&&path==='/api/v1/health')return json(200,{ok:true,api_version:1,active_jobs:store.active?1:0})
      if(req.method==='GET'&&path==='/api/v1/catalog')return json(200,await catalog())
      if(req.method==='GET'&&path==='/api/v1/jobs')return json(200,{jobs:store.list()})
      if(req.method==='POST'&&path==='/api/v1/jobs'){
        const result=await store.create(await body(req),req.headers['idempotency-key'])
        res.setHeader('Location',result.job.status_url);return json(result.reused?200:202,result)
      }
      const match=/^\/api\/v1\/jobs\/(job_[a-f0-9-]{36})(?:\/artifacts\/(video|cover|manifest|image-[1-8]))?$/.exec(path)
      if(match&&['GET','HEAD'].includes(req.method)){
        if(match[2])return await sendFile(req,res,store.artifactPath(match[1],match[2]))
        return json(200,store.get(match[1]))
      }
      throw problem(404,'Endpoint no encontrado')
    }
    if(req.headers.host!==new URL(origin).host)throw problem(403,'Host no autorizado')
    const actor=access.user(req)
    if(!actor){if(req.method==='GET'&&!path.startsWith('/api/')){res.writeHead(302,{Location:'/login','Cache-Control':'no-store'});return res.end()}throw problem(401,'Inicia sesión')}
    if(path==='/auth/me'&&req.method==='GET')return json(200,actor)
    if(path==='/auth/logout'&&req.method==='POST'){access.sameOrigin(req);res.setHeader('Set-Cookie',access.logout(req));return json(200,{ok:true})}
    if(path==='/auth/account'&&req.method==='POST'){access.sameOrigin(req);return json(200,await access.change(actor,await body(req)))}
    const handoff=/^\/api\/handoff\/(job_[a-f0-9-]{36})$/.exec(path);if(handoff&&req.method==='GET'){store.get(handoff[1]);res.setHeader('Content-Disposition','attachment; filename="gcode-project.tar.gz"');return await sendFile(req,res,join(store.dir,handoff[1],'handoff.tar.gz'))}
    if(path==='/api/automation'&&req.method==='GET')return json(200,automation.snapshot());
    if(path==='/api/batches'&&req.method==='GET')return json(200,{batches:batches.list(),quote:batchQuote});
    if(path==='/api/proposals'&&req.method==='GET'){const data=marketing.snapshot(),brand=marketing.brand(url.searchParams.get('brand')||'comandpos'),campaign=campaignContext(data,brand.id,url.searchParams.get('campaign'));return json(200,{proposals:proposals(data,brand,await creative.history(),campaign)})}
    if(path==='/api/release-preview'&&req.method==='GET'){const id=url.searchParams.get('piece_id'),p=marketing.data.pieces.find(p=>p.id===id);return json(200,{...marketing.releasePreview(id,store),automatic_schedule:!!p?.automation_slot&&automation.data.config.enabled&&p.campaign_id===automation.data.config.campaign_id})}
    if(path==='/api/marketing'&&req.method==='GET')return json(200,marketing.snapshot())
    const resource=/^\/api\/library\/([a-f0-9-]{36})$/.exec(path)
    if(resource&&['GET','HEAD'].includes(req.method))return await sendFile(req,res,marketing.asset(resource[1]).path)
    if(path==='/api/creative/issues'&&req.method==='GET'){access.require(req,['admin','editor']);return json(200,{issues:await creative.issues()})}
    if(path==='/api/voice-reviews'&&req.method==='GET'){access.require(req,['admin','editor']);return json(200,{reviews:await voiceReviews(root)})}
    const voiceReviewAudio=/^\/api\/voice-reviews\/([a-f0-9]{24})\/audio$/.exec(path);if(voiceReviewAudio&&req.method==='GET'){access.require(req,['admin','editor']);return sendFile(req,res,reviewFile(root,voiceReviewAudio[1]).replace('.json','.wav'))}
    if(path==='/api/operations'&&req.method==='GET'){access.require(req,['admin']);const budget=await creative.budget.summary(),jobs=store.list(),approved=marketing.data.releases.filter(r=>r.status==='approved');return json(200,{jobs:jobs.map(j=>({id:j.id,name:j.name,status:j.status,created_at:j.created_at,updated_at:j.updated_at,parent_job_id:j.parent_job_id,creative_id:j.creative_id,reserved_usd:budget.jobs[j.id]?.reserved||0,confirmed_usd:budget.jobs[j.id]?.actual||0,cost_complete:!budget.jobs[j.id]||budget.jobs[j.id].unconfirmed===0})),budget,approved_releases:approved.length,approval_minutes:approved.map(r=>{const j=jobs.find(j=>j.id===r.bundle.job_id);return j?(Date.parse(r.at)-Date.parse(j.created_at))/60000:null}).filter(x=>x!=null),pending_comments:marketing.data.comments.filter(c=>!c.resolved).length,uncertain_deliveries:marketing.data.deliveries.filter(d=>d.status==='uncertain').length})}
    if(path==='/api/budget'&&req.method==='GET'){access.require(req,['admin']);return json(200,await creative.budget.summary({offset:Number(url.searchParams.get('offset'))||0}))}
    if(path==='/api/capabilities'&&req.method==='GET')return json(200,capability(Object.fromEntries(url.searchParams),marketing.data.accounts));
    if(path==='/api/storage'&&req.method==='GET'){access.require(req,['admin']);return json(200,await inspectCache(root,{protectedKeys:await protectedCacheKeys(store)}))}
    if(path==='/api/accounts'&&req.method==='GET'){access.require(req,['admin']);return json(200,access.users.map(u=>({username:u.username,role:u.role})))}
    if(path==='/api/versions'&&req.method==='GET')return json(200,await versions.list(url.searchParams.get('kind'),url.searchParams.get('name')))
    if(path==='/api/version'&&req.method==='GET')return json(200,await versions.get(url.searchParams.get('kind'),url.searchParams.get('name'),url.searchParams.get('id')))
    if(req.method==='POST'){
      access.sameOrigin(req);access.require(req,['admin','editor'])
      if(path==='/api/automation/config'){access.require(req,['admin']);return json(200,await automation.configure(await body(req),actor.username))}
      if(path==='/api/automation/resume')return json(202,await automation.resume((await body(req)).id));
      if(path==='/api/automation/recover'){const d=await body(req);return json(202,await automation.recover(d.id,{allowPaid:d.allow_paid===true}))}
      if(path==='/api/automation/tick'){access.require(req,['admin']);return json(202,automation.kick({generate:false}))}
      if(path==='/api/creative/correct'){const d=await body(req);const recovery=await creative.correct(d.id,d.revision,d.content,actor.username);const result=await creative.create(recovery.input,recovery.key,actor.username);await versions.save(result.kind,result.script,actor.username);return json(200,{name:result.script.nombre,kind:result.kind})}
      if(path==='/api/voice-reviews/accept'){const d=await body(req);const out=await acceptVoiceReview(root,d.key,d,actor.username);await access.audit(actor.username,'voice_review_accepted',{key:d.key});return json(200,out)}
      if(path==='/api/voice/takes'){const d=await body(req);if(typeof d.text!=='string'||!d.text.trim()||d.text.length>500)throw problem(422,'Texto inválido');return json(200,{takes:await voiceTakes(d.text,await voiceProfile(d.profile||'n8n'))})}
      if(path==='/api/preview/scene'){const d=await body(req);if(!Number.isInteger(d.scene)||d.scene<0||d.scene>=d.script?.escenas?.length)throw problem(422,'Escena inválida');return json(200,await previewAudio(root,d.script,{scene:d.scene,audioOnly:true}))}
      if(path==='/api/handoff'){const d=await body(req);await createHandoff(store,d.id);return json(200,{url:'/api/handoff/'+d.id})}
      if(path==='/api/batches/start'){const d=await body(req);if(!Array.isArray(d.piece_ids)||d.piece_ids.length!==4)throw problem(422,'Selecciona cuatro piezas');const pieces=d.piece_ids.map(id=>marketing.data.pieces.find(p=>p.id===id));if(!pieces||pieces.some(p=>!p)||new Set(pieces.map(p=>p.kind)).size!==4||new Set(pieces.map(p=>p.campaign_id)).size!==1||new Set(pieces.map(p=>p.concept_id)).size!==1)throw problem(422,'Selecciona cuatro derivados de una propuesta');return json(202,await batches.start({pieces,allow_paid:d.allow_paid,max_budget_usd:d.max_budget_usd},req.headers['idempotency-key'],actor.username))}
      if(path==='/api/batches/retry-child'){const d=await body(req);return json(202,await batches.retryChild(d.id,d.piece_id,actor.username))}
      if(path==='/api/batches/cancel')return json(200,await batches.cancel((await body(req)).id,actor.username));
      if(path==='/api/batches/resume')return json(202,await batches.resume((await body(req)).id));
      if(path==='/api/storage/clean'){access.require(req,['admin']);const d=await body(req);return json(200,await store.exclusive(async()=>{if(store.list().some(j=>['running','queued'].includes(j.status)))throw problem(409,'Espera a que termine la producción para limpiar');const result=await cleanCache(root,d.token,{protectedKeys:await protectedCacheKeys(store)});await access.audit(actor.username,'cache_clean',result);return result}))}
      if(path==='/api/marketing/brands'){access.require(req,['admin']);return json(200,await marketing.saveBrand(await body(req),actor.username))}
      if(path==='/api/marketing/derivatives'){const d=await body(req),data=marketing.snapshot(),brand=marketing.brand(d.brand_id),campaign=campaignContext(data,brand.id,d.campaign_id);if(!campaign)throw problem(422,'Selecciona una campaña');const proposal=proposals(data,brand,await creative.history(),campaign).find(p=>p.id===d.proposal_id);if(!proposal)throw problem(422,'Propuesta no encontrada');const pieces=[];for(const draft of deriveCampaign(data,campaign,proposal)){const old=marketing.data.pieces.find(p=>p.campaign_id===campaign.id&&p.concept_id===proposal.id&&p.kind===draft.kind);pieces.push(old||await marketing.savePiece(draft,actor.username,store))}return json(200,{pieces})}
      if(path==='/api/marketing/campaigns')return json(200,await marketing.saveCampaign(await body(req),actor.username))
      if(path==='/api/marketing/pieces')return json(200,await marketing.savePiece(await body(req),actor.username,store))
      if(path==='/api/marketing/comments')return json(200,await marketing.addComment(await body(req),actor.username,store))
      if(path==='/api/marketing/comments/resolve')return json(200,await marketing.resolveComment(await body(req),actor.username))
      if(path==='/api/marketing/cancel-delivery'){access.require(req,['admin']);return json(200,await marketing.cancelDelivery(await body(req),actor.username))}
      if(path==='/api/marketing/reconcile-delivery'){access.require(req,['admin']);return json(200,await marketing.reconcileDelivery(await body(req),actor.username))}
      if(path==='/api/budget/reconcile'){access.require(req,['admin']);const d=await body(req);return json(200,await creative.budget.reconcile(d.id,d.actual_usd,d.receipt,actor.username))}
      if(path==='/api/marketing/releases'){access.require(req,['admin']);return json(200,await automation.approvePublication(await body(req),actor.username))}
      if(path==='/api/marketing/publications/import'){access.require(req,['admin']);return json(200,await marketing.importPublication(await body(req),actor.username,store))}
      if(path==='/api/marketing/schedule'){access.require(req,['admin']);return json(200,await marketing.schedule(await body(req),actor.username,store))}
      if(path==='/api/marketing/metrics')return json(200,await marketing.addMetrics(await body(req),actor.username))
      if(path==='/api/marketing/assets'){const d=await body(req,85000000);return json(201,await marketing.upload(d,Buffer.from(d.base64||'','base64'),actor.username))}
      if(/^\/api\/photos\/photo_[a-f0-9-]{36}\/retry$/.test(path))return json(202,await photos.retry(path.split('/').at(-2)))
      if(path==='/api/photos')return json(202,await photos.start(await body(req),req.headers['idempotency-key'],actor.username))
      if(path==='/api/ideas'){const input=await body(req),key=req.headers['idempotency-key'];const result=await createPiece(input,key,actor.username);await access.audit(actor.username,'idea_created',{id:result.id});return json(200,result)}
      if(path==='/api/preview/audio')return json(200,await previewAudio(root,(await body(req)).script))
      const jobAction=/^\/api\/jobs\/(job_[a-f0-9-]{36})\/(cancel|retry|review)$/.exec(path);if(jobAction){let out;if(jobAction[2]==='review'){access.require(req,['admin']);const d=await body(req);out=await store.review(jobAction[1],d.status,actor.username,d.note||'')}else if(jobAction[2]==='cancel')out=await store.cancel(jobAction[1],actor.username);else out=await marketing.retryJob(jobAction[1],req.headers['idempotency-key'],actor.username,store,url.searchParams.get('piece_id'));await access.audit(actor.username,'job_'+jobAction[2],{id:jobAction[1]});return json(200,out)}
      if(path==='/api/feed/photo'){const data=await body(req,17000000);const task=photoWrite.then(()=>approvePhoto(data,root));photoWrite=task.catch(()=>{});return json(201,await task)}
      if(path==='/api/feed/render'||path==='/api/feed/save'){const data=await body(req),s=validateFeed(data.script,data.kind);let result;if(path.endsWith('/render'))result=await store.create({brand_id:s.brand_id||'comandpos',kind:s.tipo,script:s},data.idempotency_key,'feed-editor');await versions.save(s.tipo,s,actor.username);await access.audit(actor.username,'save_feed',{name:s.nombre});return json(result?202:200,result||{ok:true})}
      if(!['/api/guardar','/api/render'].includes(path))throw problem(404,'Ruta desconocida')
      const data=await body(req),sb=validar(data.guion)
      if(path==='/api/guardar'){
        await versions.save('video',sb,actor.username);await access.audit(actor.username,'save_video',{name:sb.nombre})
        return json(200,{ok:true})
      }
      const result=await store.create({brand_id:sb.brand_id||'comandpos',kind:'video',script:sb,voice:data.voz===true,allow_paid_voice:data.cacheOnly===false,aspect:data.aspect||'vertical',preview:data.preview===true,max_budget_usd:data.max_budget_usd||2},'editor:'+randomUUID(),'editor')
      await versions.save('video',sb,actor.username);await access.audit(actor.username,'render_video',{id:result.job.id})
      return json(202,{ok:true,id:result.job.id})
    }
    if(!['GET','HEAD'].includes(req.method))throw problem(405,'Método no permitido')
    if(/^\/voice-cache\/[a-f0-9]{16}\.wav$/.test(path))return await sendFile(req,res,join(root,'voz',path.split('/').at(-1)))
    if(/^\/api\/photos\/photo_[a-f0-9-]{36}$/.test(path))return json(200,await photos.status(path.split('/').at(-1)))
    if(path==='/api/feed/catalog')return json(200,await feedCatalog(root))
    if(path==='/api/centro')return json(200,{...await catalog(),jobs:store.list()})
    const localArtifact=/^\/api\/centro\/jobs\/(job_[a-f0-9-]{36})\/artifacts\/(video|cover|manifest|image-[1-8])$/.exec(path)
    if(localArtifact)return await sendFile(req,res,store.artifactPath(localArtifact[1],localArtifact[2]))
    if(path==='/api/estado'){
      const j=store.list().find(j=>j.source==='editor')
      if(!j)return json(200,{estado:'libre',log:''})
      return json(200,{estado:['queued','running'].includes(j.status)?'renderizando':j.status==='succeeded'?'listo':'error',log:(await store.log(j.id))||j.error||'',archivo:j.status==='succeeded'?`/api/centro/jobs/${j.id}/artifacts/video`:null,id:j.id})
    }
    if(path==='/api/lista')return json(200,{guiones:(await readdir(join(root,'storyboards'))).filter(f=>!f.startsWith('.')&&f.endsWith('.json')),voces:(await readdir(join(root,'casting'))).filter(f=>/^\d.*\.mp3$/.test(f)),videos:(await readdir(join(root,'salida'))).filter(f=>!f.startsWith('.')&&f.endsWith('.mp4'))})
    const vendor=/^\/vendor\/wavesurfer\/([a-z0-9./-]+\.js)$/.exec(path);if(vendor&&!vendor[1].includes('..'))return await sendFile(req,res,join(root,'node_modules/wavesurfer.js/dist',vendor[1]));
    const route=decodeURIComponent(path==='/'?'/centro.html':path)
    if(!/^\/(automation-ui\.js|carousel-ui\.js|operations-ui\.js|design\.mjs|captions\.mjs|visual-runtime\.js|version-diff\.mjs|styles\.mjs|create-ui\.js|history\.mjs|marketing.html|marketing-ui.js|editor-tools.js|media-scenes.js|ui\.css|ui\.js|home\.js|account\.html|create\.html|editor\.html|feed-editor\.html|centro\.html|studio\.html|validar\.mjs|n8n-style\.js|formats\.js|feed\/templates\/[^/]+\.json|feed\/photos\/[a-z0-9-]+\.(jpg|png)|assets\/[^/]+|storyboards\/[^/]+\.json|casting\/[^/]+\.mp3|salida\/[^/]+\.(mp4|json))$/.test(route)||basename(route).startsWith('.'))throw problem(404,'No disponible')
    const file=resolve(root,'.'+route);if(!file.startsWith(root+sep))throw problem(403,'Ruta inválida')
    return await sendFile(req,res,file)
  }catch(e){if(!res.headersSent)json(e.status||(e.code==='ENOENT'?404:400),{error:e.message});else res.destroy()}
})
server.listen(port,process.env.STUDIO_BIND_HOST||'127.0.0.1',()=>console.log(`Centro multimedia: http://127.0.0.1:${port}/centro.html\nEditor: http://127.0.0.1:${port}\nAPI v1 habilitada; clave guardada en .studio-state/api-token (no se muestra).`))
async function shutdown(){server.close();await automation.running;await store.stop();process.exit(0)}
process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown)
