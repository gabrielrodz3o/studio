import {freezeImageRuntime} from './image-runtime.mjs'
import {Budget} from './budget.mjs'
import {freezeEvidence} from './evidence.mjs'
import {storagePreflight} from './storage.mjs'
import {assertJob} from './contracts.mjs'
import { mkdir, readFile, writeFile, rename, readdir, stat, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { validar } from './validar.mjs'
import { validateFeed, prepareFeed, executeFeed } from './feed.mjs'

const run = promisify(execFile)
const canonical = x => JSON.stringify(sort(x))
function sort(x) { return Array.isArray(x) ? x.map(sort) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sort(x[k])])) : x }
export const problem = (status, message) => Object.assign(new Error(message), { status })
export async function atomic(file, data) {
  const temp = file + '.' + randomUUID() + '.tmp'
  await writeFile(temp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 })
  await rename(temp, file)
}

export class JobStore {
  constructor({ root, publications=()=>[], dir = join(root, '.studio-state', 'jobs'), executor, maxPending = 20 }) {
    this.publications=publications; this.root = root; this.dir = dir; this.executor = executor || this.execute.bind(this)
    this.jobs = new Map(); this.keys = new Map(); this.serial = Promise.resolve()
    this.children=new Map();this.cancelled=new Set();this.liveLogs = new Map(); this.active = null; this.stopping = false; this.maxPending = maxPending
  }
  exclusive(fn) { const next = this.serial.then(fn); this.serial = next.catch(() => {}); return next }
  async init() {
    await mkdir(this.dir, { recursive: true, mode: 0o700 })
    for (const name of await readdir(this.dir)) {
      if (!/^job_[a-f0-9-]{36}$/.test(name)) continue
      let j
      try { j = JSON.parse(await readFile(join(this.dir, name, 'job.json'), 'utf8')) }
      catch (e) { if(e.code==='ENOENT'){console.warn('Solicitud incompleta omitida:',name);continue} throw new Error(`No se pudo recuperar ${name}: ${e.code || e.message}`) }
      if (j.status === 'running') {
        j.status = 'interrupted'; j.error = 'El servicio se interrumpió. No se reenvió el trabajo automáticamente.'
        j.updated_at = new Date().toISOString(); await this.persist(j)
      }
      this.jobs.set(j.id, j); this.keys.set(j.idempotency_key, j.id)
    }
    this.schedule(); return this
  }
  persist(j) { return atomic(join(this.dir, j.id, 'job.json'), j) }
  view(j) {
    if (!j) throw problem(404, 'Trabajo no encontrado')
    const publications=this.publications(j.id),published=publications.filter(p=>p.status==='published');
    return {
      id: j.id, operation_id:j.operation_id||null, status: j.status, brand_id: j.brand_id, kind: j.kind,
      template_id: j.template_id, name: j.name, source: j.source,
      created_at: j.created_at, updated_at: j.updated_at,
      resource_ids:j.resource_ids||[],campaign_id:j.campaign_id,concept_id:j.concept_id,evidence_claims:j.evidence_claims||[],creative_id:j.creative_id,parent_job_id:j.parent_job_id,caption:j.caption,checkpoint:j.checkpoint,options: j.options, brief: j.brief, error: j.error || null, stage:j.stage||j.status, progress:j.progress||0, review:j.review||{status:'pending'},
      published: published.length>0, publications, published_at:published.map(p=>p.published_at).filter(Boolean).sort().at(-1)||null, status_url: `/api/v1/jobs/${j.id}`,
      artifact: j.status === 'succeeded' ? {
        ...(j.kind==='video'?{video_url: `/api/v1/jobs/${j.id}/artifacts/video`}:{}),
        manifest_url: `/api/v1/jobs/${j.id}/artifacts/manifest`,
        ...j.artifact,
        ...(j.artifact?.images?{images:j.artifact.images.map(p=>({...p,url:`/api/v1/jobs/${j.id}/artifacts/image-${p.index}`}))}:{}),
      } : null,
    }
  }
  get(id) { return this.view(this.jobs.get(id)) }
  matchesRetry(id,parentId,key) { const j=this.jobs.get(id);return !!j&&j.parent_job_id===parentId&&j.idempotency_key===key }
  list() { return [...this.jobs.values()].sort((a,b) => b.created_at.localeCompare(a.created_at)).map(j => this.view(j)) }
  async create(request, key, source = 'api') {
    return this.exclusive(async () => {
      if (this.stopping) throw problem(503, 'El servicio se está cerrando')
      if (typeof key !== 'string' || !/^[\w.:/-]{1,160}$/.test(key)) throw problem(400, 'Se requiere Idempotency-Key de 1 a 160 caracteres')
      if (!request || typeof request !== 'object' || Array.isArray(request)) throw problem(400, 'Solicitud inválida')
      const fingerprint = createHash('sha256').update(canonical(request)).digest('hex')
      const previous = this.keys.get(key)
      if (previous) {
        const old = this.jobs.get(previous)
        if (old.fingerprint !== fingerprint) throw problem(409, 'La misma clave ya existe con otro contenido')
        return { job: this.view(old), reused: true }
      }
      assertJob(request)
      const allowed = ['budget_group','campaign_id','concept_id','creative_id','parent_job_id','caption','brand_id','kind','template_id','script','voice','subtitles','allow_paid_voice','brief','max_budget_usd','aspect','preview']
      if (Object.keys(request).some(k => !allowed.includes(k))) throw problem(400, 'La solicitud contiene campos desconocidos')
      let marketing
      try{marketing=JSON.parse(await readFile(join(this.root,'.studio-state/marketing/state.json'),'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
      const brand=marketing?.brands.find(b=>b.id===request.brand_id)
      if(!brand&&request.brand_id!=='comandpos')throw problem(422,'Marca no configurada')
      if (!['video','imagen','carrusel','historia_social'].includes(request.kind)) throw problem(422, 'Tipo de contenido no disponible')
      if(request.kind!=='video' && ['voice','subtitles','allow_paid_voice'].some(k=>request[k]!=null))throw problem(422,'Las opciones de voz solo se aplican a video')
      if (!!request.template_id === !!request.script) throw problem(400, 'Indica template_id o script, exactamente uno')
      for (const key of ['voice','subtitles','allow_paid_voice']) if (request[key] != null && typeof request[key] !== 'boolean') throw problem(400, `${key} debe ser booleano`)
      if(request.aspect!=null&&!['vertical','horizontal','square','portrait'].includes(request.aspect))throw problem(422,'Relación de aspecto inválida')
      if(request.preview!=null&&typeof request.preview!=='boolean')throw problem(422,'preview debe ser booleano')
      if(request.max_budget_usd!=null&&(!Number.isFinite(request.max_budget_usd)||request.max_budget_usd<=0||request.max_budget_usd>5))throw problem(422,'Presupuesto por trabajo entre 0 y 5 USD')
      if (request.brief != null && (typeof request.brief !== 'string' || request.brief.length > 2000)) throw problem(400, 'brief debe ser texto de hasta 2000 caracteres')
      if (source==='editor' && [...this.jobs.values()].some(j=>j.source==='editor' && ['queued','running'].includes(j.status))) throw problem(409,'Ya hay una exportación del editor en curso')
      if ([...this.jobs.values()].filter(j => ['queued','running'].includes(j.status)).length >= this.maxPending) throw problem(429, 'La cola está llena')
      let script = request.script
      if (request.template_id) {
        if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(request.template_id)) throw problem(400, 'Plantilla inválida')
        try { script = JSON.parse(await readFile(join(this.root, request.kind==='video'?'storyboards':'feed/templates', request.template_id + '.json'), 'utf8')) }
        catch (e) { if (e.code === 'ENOENT') throw problem(404, 'Plantilla no encontrada'); throw e }
      }
      script = structuredClone(script)
      if(script.evidence_claims){if(!Array.isArray(script.evidence_claims)||script.evidence_claims.some(c=>!c||typeof c!=='object'))throw problem(422,'Evidencia inválida');script.evidence_claims=freezeEvidence(script,brand)}
      if(request.kind!=='video'&&script.layout==='brand')for(const page of script.slides||[])page.id||='page-'+randomUUID();
      if(request.kind==='video')for(const scene of script.escenas||[])scene.id||='scene-'+randomUUID()
      if(request.brand_id!=='comandpos'&&(request.kind==='video'?script.escenas?.some(e=>e.tipo!=='media'):script.layout!=='brand'))throw problem(422,'Para esta marca usa escenas de recursos propios; las plantillas de ComandPOS son exclusivas de ese producto')
      if(request.kind!=='video'&&script.layout==='brand'&&script.brand_id!==request.brand_id)throw problem(422,'Marca de imagen incorrecta')
      if(brand&&request.kind==='video'){script.brand_id=brand.id;script.brand={name:brand.name,primary:brand.primary,accent:brand.accent,design:brand.design,version:brand.version||1,cta:brand.cta,website:brand.website,contact:brand.contact}}
      const resourceCopies=[]
      if(brand?.logo_resource_id&&request.kind==='video'){const logo=marketing.assets.find(a=>a.id===brand.logo_resource_id&&a.brand_id===brand.id&&a.type==='image');if(!logo)throw problem(422,'Logo no disponible');script.brand.logo_url='assets/resource-'+logo.id+'.'+logo.filename.split('.').at(-1);resourceCopies.push([join(this.root,'.studio-state/marketing/assets',logo.filename),script.brand.logo_url])}
      if(request.kind==='video'){
        for(const e of script.escenas||[])if(e.resource_id){const a=marketing?.assets.find(a=>a.id===e.resource_id&&a.brand_id===request.brand_id);if(a?.expires_at&&Date.parse(a.expires_at)<=Date.now())throw problem(422,'Los derechos del recurso vencieron');if(!a||a.type==='audio')throw problem(422,'Recurso visual no disponible para esta marca');if(a.type==='video'&&((e.clip_start||0)+e.dur>a.duration+.05))throw problem(422,'El recorte excede la duración del clip');e.media_kind=a.type;e.media_url='assets/resource-'+a.id+'.'+a.filename.split('.').at(-1);resourceCopies.push([join(this.root,'.studio-state/marketing/assets',a.filename),e.media_url])}
        if(script.music_resource_id){const a=marketing?.assets.find(a=>a.id===script.music_resource_id&&a.brand_id===request.brand_id&&a.type==='audio');if(!a)throw problem(422,'Música no disponible para esta marca');script.music_file='assets/resource-'+a.id+'.'+a.filename.split('.').at(-1);resourceCopies.push([join(this.root,'.studio-state/marketing/assets',a.filename),script.music_file])}
      }
      try { request.kind==='video'?validar(script):validateFeed(script,request.kind) } catch (e) { throw problem(422, e.message) }
      if(request.kind==='video' && (script.escenas.length>12 || script.escenas.reduce((n,e)=>n+e.dur,0)>120 || script.escenas.reduce((n,e)=>n+(e.voz||'').length,0)>1800)) throw problem(422,'Límite por trabajo: 12 escenas, 120 segundos de guion y 1800 caracteres de locución')
      if(request.kind==='video'){script.voz = request.voice ?? script.voz === true; script.subtitulos = request.subtitles ?? script.subtitulos === true}
      await storagePreflight(this.dir,{seconds:request.kind==='video'?script.escenas.reduce((n,e)=>n+e.dur,0):0});
      const id = 'job_' + randomUUID(), now = new Date().toISOString()
      const lineage=[];let parent=request.parent_job_id?this.jobs.get(request.parent_job_id):null;
      if(request.parent_job_id&&!parent)throw problem(422,'Intento anterior no encontrado');
      const seen=new Set();while(parent){if(seen.has(parent.id)||parent.brand_id!==request.brand_id||parent.kind!==request.kind)throw problem(422,'Linaje incompatible');seen.add(parent.id);lineage.unshift(parent.id);parent=parent.parent_job_id?this.jobs.get(parent.parent_job_id):null}
      const original=lineage.length?this.jobs.get(lineage[0]):null;
      const operation=await new Budget(join(this.root,'.studio-state')).bindOperation(id,lineage,original?.options.max_budget_usd||request.max_budget_usd||2);
      const job = {
        id, operation_id:operation.id, status: 'queued', source, idempotency_key: key, fingerprint,
        brand_id: request.brand_id, kind: request.kind, template_id: request.template_id || null,
        evidence_claims:script.evidence_claims||[],resource_ids:[...new Set([...(script.escenas||[]).map(e=>e.resource_id),script.resource_id,script.music_resource_id,...(script.slides||[]).map(p=>p.resource_id),brand?.logo_resource_id].filter(Boolean))],campaign_id:request.campaign_id||script.campaign_id||null,concept_id:request.concept_id||script.concept_id||null,creative_id:request.creative_id||null,parent_job_id:request.parent_job_id||null,caption:request.caption||'',name: script.nombre, brief: request.brief || '', created_at: now, updated_at: now,
        review:{status:'pending'},stage:'queued',progress:0,
        options: { budget_group:request.budget_group||null,voice: script.voz, subtitles: script.subtitulos, allow_paid_voice: request.allow_paid_voice === true,max_budget_usd:request.max_budget_usd||2,aspect:request.aspect||'vertical',preview:request.preview===true },
      }
      await mkdir(join(this.dir, id, 'artifacts'), { recursive: true, mode: 0o700 })
      if(request.kind==='video'){await mkdir(join(this.dir,id,'source'),{recursive:true});for(const name of ['studio.html','n8n-style.js','formats.js','media-scenes.js','visual-runtime.js','design.mjs','captions.mjs'])await (await import('node:fs/promises')).copyFile(join(this.root,name),join(this.dir,id,'source',name));await mkdir(join(this.dir,id,'source/assets'),{recursive:true});const sources=await Promise.all(['studio.html','n8n-style.js','formats.js','media-scenes.js','visual-runtime.js','design.mjs','captions.mjs'].map(n=>readFile(join(this.root,n),'utf8')));const refs=new Set([...sources,JSON.stringify(script)].flatMap(text=>text.match(/assets\/[a-zA-Z0-9_-]+\.(?:png|jpg|webp|ttf|mp3|wav)/g)||[]));refs.add(script.music_file||'assets/fondo-02.mp3');for(const ref of refs)if(!ref.startsWith('assets/resource-'))await copyFile(join(this.root,ref),join(this.dir,id,'source',ref));const runtime={};for(const name of ['render.mjs','voz.mjs','subtitulos.mjs','alinear.py','scene-cache.mjs','releases.mjs','validar.mjs','styles.mjs','budget.mjs','file-lock.mjs','design.mjs','captions.mjs','voz-perfil.json','voz-perfil-original.json','package-lock.json']){runtime[name]=createHash('sha256').update(await readFile(join(this.root,name))).digest('hex');await copyFile(join(this.root,name),join(this.dir,id,'source',name))}await atomic(join(this.dir,id,'runtime.json'),runtime)}
      for(const [from,to]of resourceCopies)await copyFile(from,join(this.dir,id,'source',to))
      if(request.kind!=='video'){await prepareFeed(script,join(this.dir,id),this.root);await freezeImageRuntime(this.root,join(this.dir,id))}
      await atomic(join(this.dir, id, 'script.json'), script)
      if(source==='creative'&&job.creative_id)await new Budget(join(this.root,'.studio-state')).attach('idea:'+job.creative_id,job.id)
      await this.persist(job)
      this.jobs.set(id, job); this.keys.set(key, id); this.schedule()
      return { job: this.view(job), reused: false }
    })
  }
  schedule() { queueMicrotask(() => this.pump().catch(e => { console.error('Cola:', e.message); this.stopping = true })) }
  async pump() {
    if (this.active || this.stopping) return
    const job = [...this.jobs.values()].find(j => j.status === 'queued')
    if (!job) return
    this.active = job.id
    job.status = 'running';job.stage='preparing'; job.updated_at = new Date().toISOString(); await this.persist(job)
    try {
      job.artifact = await this.executor(job, join(this.dir, job.id))
      job.status = this.cancelled.has(job.id)?'cancelled':'succeeded';job.stage=job.status;job.progress=job.status==='succeeded'?100:0; job.error = null
    } catch (e) {
      job.status = this.cancelled.has(job.id)?'cancelled':'failed';job.stage=job.status; job.error = String(e.message).replaceAll(this.root, '[studio]').slice(-1500)
    }
    job.updated_at = new Date().toISOString(); await this.persist(job)
    this.active = null; this.schedule()
  }
  async execute(job, dir) {
    await storagePreflight(dir,{seconds:120});
    if(job.kind!=='video'){job.stage='composing';const frozen=await stat(join(dir,'image-source/run.mjs')).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e});let result;if(frozen){const snapshot=JSON.parse(await readFile(join(dir,'image-runtime.json'),'utf8'));if(createHash('sha256').update(await readFile(join(this.root,'package-lock.json'))).digest('hex')!==snapshot.hashes['package-lock.json'])throw Error('Las dependencias del render de imagen cambiaron; crea una nueva versión para producir con el runtime actual');await run(process.execPath,[join(dir,'image-source/run.mjs'),dir],{timeout:120000,maxBuffer:2000000});result=JSON.parse(await readFile(join(dir,'image-result.json'),'utf8'));const runtime=JSON.parse(await readFile(join(dir,'image-runtime.json'),'utf8'));const manifest=JSON.parse(await readFile(join(dir,'artifacts/manifest.json'),'utf8'));manifest.runtime=runtime;await atomic(join(dir,'artifacts/manifest.json'),manifest);result.runtime=runtime}else result=await executeFeed(job,dir);return result}
    const frozen=await stat(join(dir,'source/render.mjs')).then(()=>true,()=>false);const args = [frozen?join(dir,'source/render.mjs'):'render.mjs', join(dir, 'script.json'), job.options.voice ? '--voz' : '--sin-voz']
    if (!job.options.allow_paid_voice) args.push('--solo-cache')
    let log = ''
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { cwd: this.root, env: { ...process.env,STUDIO_WORK_ROOT:this.root,STUDIO_JOB_ID:job.id,STUDIO_BUDGET_GROUP:job.options.budget_group||'',STUDIO_JOB_BUDGET:String(job.options.max_budget_usd||2),STUDIO_SOURCE_DIR:join(dir,'source'),STUDIO_ASPECT:job.options.aspect||'vertical',STUDIO_PREVIEW:job.options.preview?'1':'0', STUDIO_OUTPUT_DIR: join(dir, 'artifacts') },detached:process.platform!=='win32', stdio: ['ignore','pipe','pipe'] })
      this.children.set(job.id,child);const timer=setTimeout(()=>{job.stage='timeout';try{process.kill(-child.pid,'SIGKILL')}catch{child.kill('SIGKILL')}},30*60000);
      const progressTimer=setInterval(()=>{this.exclusive(async()=>{if(job.status!=='running')return;try{job.checkpoint=JSON.parse(await readFile(join(dir,'artifacts/checkpoint.json'),'utf8'));job.stage=job.checkpoint.stage}catch(e){if(e.code!=='ENOENT')console.warn('Checkpoint:',e.message)}job.updated_at=new Date().toISOString();await this.persist(job)}).catch(e=>console.warn('Progreso:',e.message))},3000);progressTimer.unref();
      const append = b => { const text=b.toString();log = (log + text).slice(-16000); this.liveLogs.set(job.id,log);if(text.includes('voz '))job.stage='voice';const m=/(\d+)%/.exec(text);if(m){job.stage='rendering';job.progress=Math.min(94,15+Math.round(Number(m[1])*.8))}if(text.includes('video mudo listo')){job.stage='mixing';job.progress=95} }
      child.on('close',()=>{clearInterval(progressTimer);clearTimeout(timer);this.children.delete(job.id)})
      child.stdout.on('data', append); child.stderr.on('data', append)
      child.on('error', reject); child.on('close', resolve)
    })
    await writeFile(join(dir, 'render.log'), log, { mode: 0o600 }); this.liveLogs.delete(job.id)
    if (code !== 0) throw new Error(`Render falló (${code}). ${log.slice(-1200)}`)
    const script = JSON.parse(await readFile(join(dir, 'script.json'), 'utf8'))
    const stem = script.nombre + (job.options.voice && script.escenas.some(e => e.voz) ? '-voz' : '')
    const video = join(dir, 'artifacts', stem + '.mp4'), manifest = join(dir, 'artifacts', stem + '.json')
    await stat(manifest)
    job.stage='quality';
    const {stdout} = await run('ffprobe', ['-v','error','-show_entries','format=duration:stream=codec_type,width,height,codec_name','-of','json',video])
    const info = JSON.parse(stdout), v = info.streams.find(s => s.codec_type === 'video'), a = info.streams.find(s => s.codec_type === 'audio')
    const expected=job.options.preview?({vertical:[540,960],horizontal:[960,540],square:[540,540],portrait:[432,540]}[job.options.aspect||'vertical']):({vertical:[1080,1920],horizontal:[1920,1080],square:[1080,1080],portrait:[1080,1350]}[job.options.aspect||'vertical']);
    if (v?.width !== expected[0] || v?.height !== expected[1] || v?.codec_name !== 'h264' || a?.codec_name !== 'aac' || !(Number(info.format.duration) > 0)) throw new Error('El archivo no pasó la verificación técnica')
    await run('ffmpeg',['-v','error','-y','-ss',String(Math.min(script.cover_time??.8,Number(info.format.duration)-.1)),'-i',video,'-frames:v','1','-vf','scale=360:-2','-threads','1',join(dir,'artifacts','cover.jpg')],{timeout:30000}).catch(()=>{})
    const report=JSON.parse(await readFile(manifest,'utf8')).quality||{warnings:[]}
    const cover=await readFile(join(dir,'artifacts','cover.jpg')).catch(()=>null)
    const bytes = await readFile(video)
    return { cover_sha256:cover?createHash('sha256').update(cover).digest('hex'):null, filename: stem + '.mp4', manifest_filename: stem + '.json', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), duration: Number(info.format.duration), width: v.width, height: v.height, content_type: 'video/mp4', quality:report }
  }
  artifactPath(id, kind) {
    const j = this.jobs.get(id)
    if (!j) throw problem(404, 'Trabajo no encontrado')
    if (j.status !== 'succeeded') throw problem(409, 'El archivo todavía no está listo')
    if(kind==='cover'&&j.kind==='video')return join(this.dir,id,'artifacts','cover.jpg')
    if(/^image-[1-8]$/.test(kind)){const p=j.artifact.images?.find(p=>'image-'+p.index===kind);if(!p)throw problem(404,'Página no encontrada');return join(this.dir,id,'artifacts',p.filename)}
    if (!['video','manifest'].includes(kind)||(kind==='video'&&j.kind!=='video')) throw problem(404, 'Archivo no encontrado')
    return join(this.dir, id, 'artifacts', kind === 'video' ? j.artifact.filename : j.artifact.manifest_filename)
  }
  async cancel(id,actor='api'){const j=this.jobs.get(id);if(!j)throw problem(404,'Trabajo no encontrado');if(!['queued','running'].includes(j.status))throw problem(409,'Solo puedes cancelar trabajos en cola o ejecución');this.cancelled.add(id);j.cancelled_by=actor;if(j.status==='queued'){j.status='cancelled';j.stage='cancelled';await this.persist(j)}else{const child=this.children.get(id);if(child){try{process.kill(-child.pid,'SIGTERM')}catch{child.kill('SIGTERM')}const t=setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL')}catch{}},3000);t.unref()}}return this.view(j)}
  async review(id,status,actor,note=''){const j=this.jobs.get(id);if(!j)throw problem(404,'Trabajo no encontrado');if(j.status!=='succeeded'||!['approved','rejected'].includes(status)||typeof note!=='string'||note.length>1000)throw problem(422,'Revisión inválida');j.review={status,actor,note,at:new Date().toISOString()};await this.persist(j);return this.view(j)}
  async retry(id,key,{cacheOnly=false,allowPaid=false}={}){const j=this.jobs.get(id);if(!j||!['failed','interrupted','cancelled'].includes(j.status))throw problem(409,'Solo se reintentan trabajos fallidos, interrumpidos o cancelados');const script=JSON.parse(await readFile(join(this.dir,id,'script.json'),'utf8'));return this.create({brand_id:j.brand_id,kind:j.kind,...(j.options.budget_group?{budget_group:j.options.budget_group}:{}),script,parent_job_id:j.id,caption:j.caption||'',brief:j.brief||'',...(j.creative_id?{creative_id:j.creative_id}:{}),...(j.campaign_id?{campaign_id:j.campaign_id}:{}),...(j.concept_id?{concept_id:j.concept_id}:{}),...(j.kind==='video'?{voice:j.options.voice,subtitles:j.options.subtitles,allow_paid_voice:cacheOnly?false:allowPaid===true?true:j.options.allow_paid_voice,max_budget_usd:j.options.max_budget_usd,aspect:j.options.aspect,preview:j.options.preview}:{})},key,j.source)}
  async log(id) { if (!this.jobs.has(id)) throw problem(404, 'Trabajo no encontrado'); if(this.liveLogs.has(id))return this.liveLogs.get(id); return readFile(join(this.dir, id, 'render.log'), 'utf8').catch(() => '') }
  async stop() {
    this.stopping = true
    await this.serial
    while (this.active) await new Promise(r => setTimeout(r, 100))
  }
}
