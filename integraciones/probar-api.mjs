// Studio debe estar encendido. Esta prueba reutiliza audios; no pide voces pagadas.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const base=process.env.STUDIO_BASE_URL||'http://127.0.0.1:4173'
const token=(process.env.STUDIO_API_TOKEN||await readFile(new URL('../.studio-state/api-token',import.meta.url),'utf8')).trim()
const auth={Authorization:'Bearer '+token}
const headers={...auth,'Content-Type':'application/json','Idempotency-Key':'audit-http-20260930-v1'}
const request={brand_id:'comandpos',kind:'video',template_id:'comercial-n8n',voice:true,subtitles:true,allow_paid_voice:false,brief:'Prueba local del recorrido API: solicitar, consultar y descargar. No publicar.'}
assert.equal((await fetch(base+'/api/v1/catalog')).status,401)
assert.equal((await fetch(base+'/.studio-state/api-token')).status,404)
const cat=await(await fetch(base+'/api/v1/catalog',{headers:auth})).json()
assert.ok(cat.templates.some(t=>t.id==='comercial-n8n'))
const results=await Promise.all(Array.from({length:3},()=>fetch(base+'/api/v1/jobs',{method:'POST',headers,body:JSON.stringify(request)}).then(async r=>{assert.ok([200,202].includes(r.status));return r.json()})))
assert.equal(new Set(results.map(r=>r.job.id)).size,1)
const id=results[0].job.id;console.log('Trabajo:',id,'; solicitudes repetidas: mismo ID')
assert.equal((await fetch(base+'/api/v1/jobs',{method:'POST',headers,body:JSON.stringify({...request,voice:false})})).status,409)
let job
for(let i=0;i<180;i++){
 job=await(await fetch(base+'/api/v1/jobs/'+id,{headers:auth})).json()
 if(!['queued','running'].includes(job.status))break
 if(i%10===0)console.log('Estado:',job.status)
 await new Promise(r=>setTimeout(r,1000))
}
assert.equal(job.status,'succeeded',job.error||'El trabajo no terminó')
const range=await fetch(base+job.artifact.video_url,{headers:{...auth,Range:'bytes=0-1023'}})
assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,1024)
const video=await fetch(base+job.artifact.video_url,{headers:auth});assert.equal(video.status,200)
const bytes=Buffer.from(await video.arrayBuffer())
assert.equal(createHash('sha256').update(bytes).digest('hex'),job.artifact.sha256)
const manifest=await(await fetch(base+job.artifact.manifest_url,{headers:auth})).json()
assert.equal(manifest.guion.nombre,'comercial-n8n')
assert.ok((await(await fetch(base+'/api/centro')).json()).jobs.some(j=>j.id===id))
const proof={fecha:new Date().toISOString(),job_id:id,status:job.status,authentication:401,secret_not_served:404,idempotency:'3 solicitudes devolvieron el mismo trabajo',conflict:409,range:206,sha256:job.artifact.sha256,bytes:bytes.length,duration:job.artifact.duration,paid_voice:false,remote_n8n:'No conectado; prueba realizada por HTTP local'}
await writeFile(new URL('../salida/verificacion-api.json',import.meta.url),JSON.stringify(proof,null,2)+'\n')
console.log('API verificada: autenticación, idempotencia, render, descarga parcial y checksum.',job.artifact.duration+' s')
