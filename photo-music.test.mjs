import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {Marketing} from './marketing.mjs'
import {capability} from './capabilities.mjs'
import {publicationBundle} from './releases.mjs'
async function fixture(t,channel='tiktok'){
 const root=await mkdtemp(join(tmpdir(),'studio-photo-music-'));t.after(()=>rm(root,{recursive:true,force:true}))
 const m=await new Marketing(root).init(),campaign=await m.saveCampaign({brand_id:'comandpos',name:'Fotos',status:'active'},'admin')
 const job={id:'photo-job',brand_id:'comandpos',kind:'carrusel',status:'succeeded',review:{status:'approved'},artifact:{images:[{index:1,sha256:'a'.repeat(64)},{index:2,sha256:'b'.repeat(64)}]}}
 const store={get:()=>structuredClone(job)},input={campaign_id:campaign.id,title:'Facturación electrónica',caption:'Contenido revisado.',kind:'carrusel',channel,job_id:job.id,scheduled_at:new Date(Date.now()+60000).toISOString()}
 return {root,m,store,job,input}
}
test('solicitar música persiste en ambas plataformas y bloquea envío sin sonido',async t=>{
 for(const channel of ['instagram','tiktok']){
  const {root,m,store,input}=await fixture(t,channel)
  let p=await m.savePiece({...input,music_mode:'recommended'},'admin',store)
  const preview=m.releasePreview(p.id,store)
  assert.equal(preview.capability.supported,false)
  assert.deepEqual(preview.bundle.music,{mode:'recommended',required:true,preserve_photo:true})
  await m.approveRelease({piece_id:p.id,hash:preview.hash},'admin',store)
  await assert.rejects(m.schedule({piece_id:p.id},'admin',store),/API|conector/)
  assert.equal(m.snapshot().deliveries.length,0)
  const {music_mode,...patch}=p
  p=await m.savePiece({...patch,title:'Título corregido'},'admin',store)
  assert.equal(p.music_mode,'recommended')
  const restored=await new Marketing(root).init()
  assert.equal(restored.snapshot().pieces[0].music_mode,'recommended')
 }
})
test('cambio de música revoca aprobación; ninguna bandera del navegador habilita publicación',async t=>{
 const {m,store,input}=await fixture(t)
 const p=await m.savePiece(input,'admin',store),before=m.releasePreview(p.id,store)
 await m.approveRelease({piece_id:p.id,hash:before.hash},'admin',store)
 await m.savePiece({...p,music_mode:'recommended'},'admin',store)
 assert.equal(m.snapshot().releases[0].status,'revoked')
 assert.notEqual(m.releasePreview(p.id,store).hash,before.hash)
 assert.equal(capability({...input,brand_id:'comandpos',music_mode:'recommended'},[{channel:'tiktok',logged_in:true,music_supported:true}]).supported,false)
})
test('formatos y valores no admitidos no se guardan; publicaciones antiguas conservan bundle sin música',async t=>{
 const {m,store,input,job}=await fixture(t)
 for(const d of [{music_mode:'trending'},{music_mode:'recommended',kind:'video'},{music_mode:'recommended',channel:'facebook'}])await assert.rejects(m.savePiece({...input,...d},'admin',store),/música/)
 assert.equal(m.snapshot().pieces.length,0)
 const p=await m.savePiece(input,'admin',store),preview=m.releasePreview(p.id,store)
 assert.equal('music' in preview.bundle,false)
 const {music_mode,...legacy}=p
 assert.deepEqual(publicationBundle(p,job,{},{}),publicationBundle(legacy,job,{},{}))
 await m.approveRelease({piece_id:p.id,hash:preview.hash},'admin',store)
 const delivery=await m.schedule({piece_id:p.id},'admin',store)
 assert.equal(delivery.status,'scheduled')
 // Even unexpected out-of-band state changes cannot bypass claim-time enforcement.
 m.data.pieces.find(x=>x.id===p.id).music_mode='recommended'
 m.data.deliveries[0].scheduled_at=new Date(Date.now()-1000).toISOString()
 const claimed=await m.claim({channel:'tiktok'},'n8n',store)
 assert.equal(claimed.status,'blocked');assert.equal(claimed.claim_token,undefined)
})
