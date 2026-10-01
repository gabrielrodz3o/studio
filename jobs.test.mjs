import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {randomUUID} from 'node:crypto'
import {JobStore,atomic} from './jobs.mjs'
const sample={nombre:'prueba',formato:'historia',voz:false,escenas:[{tipo:'transicion',dur:3,texto:'Una idea'}]}
const req={brand_id:'comandpos',kind:'video',template_id:'prueba'}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function ready(store,id){for(let i=0;i<200;i++){const j=store.get(id);if(!['queued','running'].includes(j.status))return j;await sleep(5)}throw Error('Timeout de prueba')}
async function fixture(t,executor){const root=await mkdtemp(join(tmpdir(),'studio-jobs-'));await mkdir(join(root,'assets'));await writeFile(join(root,'assets/fondo-02.mp3'),'fixture');for(const f of ['render.mjs','voz.mjs','subtitulos.mjs','alinear.py','scene-cache.mjs','releases.mjs','validar.mjs','styles.mjs','budget.mjs','voz-perfil.json','voz-perfil-original.json','package-lock.json'])await writeFile(join(root,f),'fixture');for(const f of ['studio.html','n8n-style.js','formats.js','media-scenes.js'])await writeFile(join(root,f),'test');await mkdir(join(root,'storyboards'));await writeFile(join(root,'storyboards/prueba.json'),JSON.stringify(sample));const store=await new JobStore({root,executor}).init();t.after(async()=>{await store.stop();await rm(root,{recursive:true,force:true})});return {root,store}}
const output={filename:'prueba.mp4',manifest_filename:'prueba.json',bytes:10,sha256:'test',duration:3,width:1080,height:1920}
test('peticiones concurrentes con la misma clave producen un único trabajo',async t=>{
 let calls=0;const{store}=await fixture(t,async()=>{calls++;await sleep(20);return output})
 const results=await Promise.all(Array.from({length:8},()=>store.create(req,'daily:one')))
 assert.equal(new Set(results.map(r=>r.job.id)).size,1)
 assert.equal(results.filter(r=>!r.reused).length,1)
 const j=await ready(store,results[0].job.id);assert.equal(j.status,'succeeded');assert.equal(calls,1);assert.equal(j.options.allow_paid_voice,false)
 await assert.rejects(store.create({...req,voice:true},'daily:one'),e=>e.status===409)
})
test('guion y resultado quedan separados por trabajo; editar la plantilla no altera una solicitud anterior',async t=>{
 const{root,store}=await fixture(t,async()=>output)
 const a=await store.create(req,'first');await ready(store,a.job.id)
 await writeFile(join(root,'storyboards/prueba.json'),JSON.stringify({...sample,escenas:[{tipo:'transicion',dur:4,texto:'Texto cambiado'}]}))
 const replay=await store.create(req,'first');assert.equal(replay.job.id,a.job.id)
 const b=await store.create(req,'second');await ready(store,b.job.id)
 assert.notEqual(store.artifactPath(a.job.id,'video'),store.artifactPath(b.job.id,'video'))
 const old=JSON.parse(await readFile(join(store.dir,a.job.id,'script.json'),'utf8'));assert.equal(old.escenas[0].texto,'Una idea');await writeFile(join(root,'render.mjs'),'changed runtime');assert.equal(await readFile(join(store.dir,a.job.id,'source/render.mjs'),'utf8'),'fixture');assert.ok(JSON.parse(await readFile(join(store.dir,a.job.id,'runtime.json'),'utf8'))['render.mjs'])
})
test('fallos se conservan y no se vuelven a ejecutar por repetir la misma petición',async t=>{
 let calls=0;const{store}=await fixture(t,async()=>{calls++;throw Error('Proveedor pendiente')})
 const a=await store.create(req,'fail');const j=await ready(store,a.job.id);assert.equal(j.status,'failed')
 assert.match(j.error,/Proveedor pendiente/);await store.create(req,'fail');assert.equal(calls,1)
 assert.throws(()=>store.artifactPath(j.id,'video'),e=>e.status===409)
})
test('al reiniciar se recupera la cola y los trabajos en curso quedan interrumpidos sin reenvío',async t=>{
 const{root,store}=await fixture(t,async()=>output)
 const r=await store.create(req,'running');await ready(store,r.job.id);await store.stop()
 const old=JSON.parse(await readFile(join(store.dir,r.job.id,'job.json'),'utf8'));old.status='running';await atomic(join(store.dir,r.job.id,'job.json'),old)
 const pending={...old,id:'job_'+randomUUID(),status:'queued',idempotency_key:'queued'};delete pending.artifact
 await mkdir(join(store.dir,pending.id,'artifacts'),{recursive:true});await atomic(join(store.dir,pending.id,'script.json'),sample);await atomic(join(store.dir,pending.id,'job.json'),pending)
 let count=0;const restored=await new JobStore({root,executor:async()=>{count++;return output}}).init();t.after(()=>restored.stop())
 assert.equal(restored.get(old.id).status,'interrupted');assert.equal((await ready(restored,pending.id)).status,'succeeded');assert.equal(count,1)
 assert.equal((await restored.create(req,'running')).job.id,old.id)
})
test('rechaza módulos pendientes, rutas inválidas y opciones ambiguas',async t=>{
 const{store}=await fixture(t,async()=>output)
 for(const [r,key,status]of [[{...req,kind:'audio'},'photo',422],[{...req,template_id:'../secreto'},'path',400],[{...req,allowPaidVoice:true},'typo',400],[req,'',400]])await assert.rejects(store.create(r,key),e=>e.status===status)
})

test('cancelar en cola no ejecuta; reintentar conserva guion y aprobación exige resultado',async t=>{
 let release;const gate=new Promise(r=>release=r);let count=0;const {store}=await fixture(t,async()=>{count++;if(count===1)await gate;return output});
 const a=await store.create(req,'hold');await sleep(10);const b=await store.create(req,'cancel');
 await store.cancel(b.job.id,'gabriel');assert.equal(store.get(b.job.id).status,'cancelled');
 await assert.rejects(store.review(b.job.id,'approved','gabriel'),e=>e.status===422);
 release();await ready(store,a.job.id);assert.equal(count,1);
 const retry=await store.retry(b.job.id,'retry');assert.notEqual(retry.job.id,b.job.id);await ready(store,retry.job.id);assert.equal(count,2);
 assert.equal(store.get(retry.job.id).review.status,'pending');await store.review(retry.job.id,'approved','gabriel','Visto y escuchado');assert.equal(store.get(retry.job.id).review.actor,'gabriel');
 const record=JSON.parse(await readFile(join(store.dir,retry.job.id,'job.json'),'utf8'));assert.equal(record.review.status,'approved');
});
