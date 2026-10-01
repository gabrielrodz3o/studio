import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdtemp,mkdir,cp,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'
import {validateFeed,prepareFeed,inspectPhoto,executeFeed} from './feed.mjs'
const root=dirname(fileURLToPath(import.meta.url)),sample=JSON.parse(await readFile(join(root,'feed/templates/carrusel-insumos.json')))
test('rechaza carruseles incompletos, capturas ajenas y afirmaciones sin respaldo',()=>{
 for(const s of [{...sample,slides:[]},{...sample,captura:'../../private'},{...sample,titular:'Ahorra 50% garantizado'},{...sample,layout:'product-scene',captura:null}])assert.throws(()=>validateFeed(s,'carrusel'))
 assert.equal(validateFeed(sample,'carrusel').slides.length,4)
})
test('foto pertinente y copia de recursos; el render no depende de cambios posteriores en la biblioteca',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feed-snapshot-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'artifacts'))
 await prepareFeed(sample,dir,root);assert.ok((await readFile(join(dir,'photo.jpg'))).length>10000)
 await assert.rejects(prepareFeed({...sample,tema_id:'1-educativo-9'},dir,root),/no está revisada/)
 const original=await readFile(join(root,'feed/templates/carrusel-insumos.json'));await writeFile(join(dir,'script.json'),original)
 const a=await executeFeed({kind:'carrusel'},dir);assert.equal(a.images.length,4);assert.ok(a.images.every(i=>i.width===1080&&i.height===1350));assert.equal(new Set(a.images.map(i=>i.sha256)).size,4)
})
test('OCR retiene carteles legibles y rechaza imágenes pequeñas',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feed-ocr-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const file=join(dir,'poster.png');await sharp(Buffer.from('<svg width="1200" height="900"><rect width="1200" height="900" fill="white"/><text x="100" y="300" font-family="sans-serif" font-size="90" fill="black">OFERTA RESTAURANTE</text></svg>')).png().toFile(file)
 await assert.rejects(inspectPhoto(file),/posible texto/);const candidates=await inspectPhoto(file,{collect:true});assert.equal(candidates.ocr,'needs_visual_confirmation');assert.ok(candidates.candidates.length>0)
 const small=join(dir,'small.png');await sharp({create:{width:100,height:100,channels:3,background:'white'}}).png().toFile(small);await assert.rejects(inspectPhoto(small),/900/)
})
test('las tres composiciones producen piezas legibles y rechazan desbordes',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feed-layouts-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'artifacts'))
 const template={...sample,nombre:'variantes',tipo:'imagen',slides:[],captura:'cuenta'}
 for(const layout of ['hero','photo-first','product-scene']){
  const s={...template,layout};await prepareFeed(s,dir,root);await writeFile(join(dir,'script.json'),JSON.stringify(s));const result=await executeFeed({kind:'imagen'},dir);assert.equal(result.images[0].validation.layout,layout);assert.ok(result.images[0].validation.metrics.every(m=>m.x+m.width<=1042&&m.y+m.height<=1320))
 }
 await writeFile(join(dir,'script.json'),JSON.stringify({...template,titular:'x'.repeat(81)}));await assert.rejects(executeFeed({kind:'imagen'},dir),/titular/)
})
test('incorporar fotos exige confirmación visual y registra un hash del archivo',async t=>{
 const {approvePhoto}=await import('./feed.mjs');const dir=await mkdtemp(join(tmpdir(),'feed-import-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'feed/photos'),{recursive:true});await cp(join(root,'feed/topics.json'),join(dir,'feed/topics.json'));await writeFile(join(dir,'feed/photos.json'),'[]');
 const input={title:'Ingredientes revisados',scene:'Una encargada revisa ingredientes frescos en una cocina de restaurante.',topic_id:sample.tema_id,confirm_scene:true,data:(await readFile(join(root,'feed/photos/insumos.png'))).toString('base64')};
 await assert.rejects(approvePhoto({...input,confirm_scene:false},dir),/confirma/)
 const result=await approvePhoto(input,dir),photos=JSON.parse(await readFile(join(dir,'feed/photos.json')));assert.equal(photos[0].id,result.id);assert.match(photos[0].sha256,/^[a-f0-9]{64}$/);assert.equal(photos[0].review.ocr.ocr,'passed')
})
test('historia deja márgenes para la interfaz de redes y conserva formato vertical',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feed-story-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'artifacts'));const s=JSON.parse(await readFile(join(root,'feed/templates/historia-insumos.json')));await prepareFeed(s,dir,root);await writeFile(join(dir,'script.json'),JSON.stringify(s));const r=await executeFeed({kind:'historia_social'},dir);assert.equal(r.images[0].height,1920);assert.equal(r.images[0].width,1080);assert.ok(r.images[0].validation.metrics.every(m=>m.y>=220&&m.y+m.height<=1570));
});

test('legacy carousel renders six pages and closes on the final page',async t=>{const dir=await mkdtemp(join(tmpdir(),'feed-six-'));t.after(()=>rm(dir,{recursive:true,force:true}));await mkdir(join(dir,'artifacts'));const script=JSON.parse(await readFile(join(root,'feed/templates/carrusel-insumos.json')));script.slides.splice(2,0,{titulo:'Revisa las existencias',texto:'Consulta la información antes de continuar.'},{titulo:'Consulta los detalles',texto:'Revisa los datos de cada ingrediente.'});script.slides=script.slides.map((p,i)=>({...p,id:'page-'+i}));validateFeed(script,'carrusel');await prepareFeed(script,dir,root);await writeFile(join(dir,'script.json'),JSON.stringify(script));const r=await executeFeed({kind:'carrusel'},dir);assert.equal(r.images.length,6);assert.ok(r.images.at(-1).validation.metrics.some(m=>m.label==='end-body'));});
