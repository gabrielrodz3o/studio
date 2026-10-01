import {validateBrandFeed,prepareBrandFeed,executeBrandFeed} from './brand-feed.mjs'
import './fontconfig.mjs'
import sharp from 'sharp'
import fs from 'node:fs'
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises'
import {join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash,randomUUID} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {renderFeed} from './feed/renderer.cjs'
const run=promisify(execFile),ROOT=dirname(fileURLToPath(import.meta.url))
const hash=b=>createHash('sha256').update(b).digest('hex')
const readJSON=async p=>JSON.parse(await readFile(p,'utf8'))
let photoChanges=Promise.resolve();
export function addPhoto(entry,root=ROOT){const next=photoChanges.then(async()=>{const catalog=await readJSON(join(root,'feed/photos.json'));if(!catalog.some(p=>p.id===entry.id))catalog.push(entry);const tmp=join(root,'feed/photos.json.'+randomUUID()+'.tmp');await writeFile(tmp,JSON.stringify(catalog,null,2)+'\n');await fs.promises.rename(tmp,join(root,'feed/photos.json'))});photoChanges=next.catch(()=>{});return next}
export async function feedCatalog(root=ROOT){
 const photos=await readJSON(join(root,'feed/photos.json')),topics=await readJSON(join(root,'feed/topics.json'))
 return {photos:photos.map(({file,sha256,...p})=>({...p,url:'/feed/photos/'+file})),topics,layouts:['hero','photo-first','product-scene'],captures:fs.readdirSync(join(root,'feed/brand')).filter(f=>f.endsWith('.webp')).map(f=>f.slice(0,-5))}
}
export function validateFeed(s,kind){
 if(s?.layout==='brand')return validateBrandFeed(s,kind)
 if(!s||typeof s!=='object'||Array.isArray(s))throw Error('Guion de imagen inválido')
 const keys=['nombre','tipo','tema_id','titular','subtitulo','caption','cta','layout','foto_id','captura','slides']
 if(Object.keys(s).some(k=>!keys.includes(k)))throw Error('Campo de imagen desconocido')
 if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(s.nombre))throw Error('Nombre inválido')
 if(!['imagen','carrusel','historia_social'].includes(kind)||s.tipo!==kind)throw Error('El tipo de pieza no coincide')
 for(const [k,min,max]of[['tema_id',1,80],['titular',3,80],['subtitulo',3,150],['caption',20,2200],['cta',3,60],['foto_id',1,80]]){
  if(typeof s[k]!=='string'||s[k].trim().length<min||s[k].length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s[k]))throw Error('Revisa '+k+' (máximo '+max+' caracteres)')
 }
 if(!['hero','photo-first','product-scene'].includes(s.layout))throw Error('Composición inválida')
 const captures=['cocina','mesas','cuenta','cuentaxcobrar','comtabilidad','reporteBI','recursohumanos_empleados','nomina']
 if(s.captura!=null&&!captures.includes(s.captura))throw Error('Captura no aprobada')
 if(s.layout==='product-scene'&&!s.captura)throw Error('El diseño de producto necesita una captura real')
 if(!Array.isArray(s.slides)||s.slides.length!==(kind==='carrusel'?4:0))throw Error('El carrusel requiere exactamente cuatro páginas')
 for(const slide of s.slides){if(!slide||Object.keys(slide).some(k=>!['titulo','texto'].includes(k))||typeof slide.titulo!=='string'||!slide.titulo.trim()||slide.titulo.length>80||typeof slide.texto!=='string'||!slide.texto.trim()||slide.texto.length>240)throw Error('Página inválida o demasiado extensa')}
 if(/demo gratis|demo gratuita|caso real|garantiz|\d+\s*%/i.test([s.titular,s.subtitulo,s.caption,...s.slides.flatMap(x=>[x.titulo,x.texto])].join(' ')))throw Error('Afirmación que requiere evidencia: revisa el texto antes de producir')
 return structuredClone(s)
}
export async function inspectPhoto(file,{collect=false}={}){
 const metadata=await sharp(file).metadata()
 if(!metadata.width||metadata.width<900||metadata.height<650)throw Error('La foto debe medir al menos 900 × 650')
 let stdout
 try{({stdout}=await run('tesseract',[file,'stdout','--psm','11','tsv'],{maxBuffer:4*1024*1024,timeout:60000}))}
 catch{throw Error('No se pudo ejecutar el control OCR de la fotografía; instala tesseract')}
 const words=stdout.split('\n').slice(1).map(l=>l.split('\t')).filter(x=>Number(x[10])>=65&&/[a-záéíóúñ]{3}/i.test(x[11]||'')).map(x=>x[11])
 if(words.length&&!collect)throw Error('Fotografía retenida: contiene posible texto ('+words.slice(0,8).join(', ')+'). Usa una foto sin carteles ni letras.')
 return {ocr:words.length?'needs_visual_confirmation':'passed',engine:'tesseract',words_detected:words.length,candidates:words.slice(0,20),width:metadata.width,height:metadata.height,limitation:'OCR no detecta todos los textos ni evalúa anatomía o pertinencia. Requiere revisión visual.'}
}
export async function approvePhoto(input,root=ROOT){
 if(!input||typeof input.title!=='string'||input.title.trim().length<3||input.title.length>100||input.confirm_scene!==true||typeof input.scene!=='string'||input.scene.trim().length<20||input.scene.length>500)throw Error('Describe la escena y confirma que revisaste su relación con el tema y la anatomía')
 const topics=await readJSON(join(root,'feed/topics.json'))
 if(!topics.some(t=>t.id===input.topic_id))throw Error('Tema no encontrado')
 if(typeof input.data!=='string'||!/^[A-Za-z0-9+/=]+$/.test(input.data)||input.data.length>16000000)throw Error('Foto inválida o demasiado grande')
 const bytes=Buffer.from(input.data,'base64');if(bytes.length>12*1024*1024)throw Error('Máximo 12 MB')
 const id='foto-'+randomUUID(),file=id+'.jpg',path=join(root,'feed/photos',file)
 try{
  await sharp(bytes,{limitInputPixels:40000000}).rotate().jpeg({quality:95}).toFile(path)
  const ocr=await inspectPhoto(path)
  const entry={id,file,title:input.title.trim(),source:'Foto incorporada desde el editor local',sha256:hash(await readFile(path)),review:{status:'approved',reviewer:'Usuario: confirmación visual en editor',scene:input.scene.trim(),topic_ids:[input.topic_id],ocr}}
  await addPhoto(entry,root)
  return {id,title:entry.title,url:'/feed/photos/'+file}
 }catch(e){await fs.promises.unlink(path).catch(()=>{});throw e}
}
export async function prepareFeed(s,dir,root=ROOT){
 if(s.layout==='brand')return prepareBrandFeed(s,dir,root)
 const photos=await readJSON(join(root,'feed/photos.json')),topics=await readJSON(join(root,'feed/topics.json'))
 const photo=photos.find(p=>p.id===s.foto_id)
 if(!topics.some(t=>t.id===s.tema_id))throw Error('Tema no encontrado')
 if(photo?.review?.status!=='approved'||!photo.review.topic_ids.includes(s.tema_id))throw Error('La foto no está revisada para este tema. Incorpora una foto pertinente desde el editor.')
 const path=await realpath(join(root,'feed/photos',photo.file)),parent=await realpath(join(root,'feed/photos'))
 if(!path.startsWith(parent+'/'))throw Error('Ruta de fotografía inválida')
 const bytes=await readFile(path);if(hash(bytes)!==photo.sha256)throw Error('La fotografía cambió después de su revisión')
 await writeFile(join(dir,'photo.jpg'),await sharp(bytes).jpeg({quality:98}).toBuffer())
 // Snapshot all visual sources so queued work does not change when the library changes.
 await mkdir(join(dir,'brand'),{recursive:true})
 for(const name of ['logo.png','Montserrat.ttf','Montserrat-Black.ttf',...(s.captura?[s.captura+'.webp']:[])])await fs.promises.copyFile(join(root,'feed/brand',name),join(dir,'brand',name))
 await writeFile(join(dir,'photo-review.json'),JSON.stringify(photo,null,2))
}
export async function executeFeed(job,dir){
 if((await readJSON(join(dir,'script.json'))).layout==='brand')return executeBrandFeed(job,dir)
 const s=validateFeed(await readJSON(join(dir,'script.json')),job.kind),photo=await readJSON(join(dir,'photo-review.json'))
 const ocr=await inspectPhoto(join(dir,'photo.jpg'))
 const c={texto_en_imagen:s.titular,ctaVisual:s.cta,tipo_contenido:'educativo',story:s.tipo==='historia_social',photo_file:join(dir,'photo.jpg'),product_asset:s.captura,design:{layout:s.layout,subline:s.subtitulo,commercial:!!s.captura}}
 const pages=s.tipo!=='carrusel'?[null]:s.slides.map((p,i)=>({slideIndex:i+1,slideText:p.titulo,slideBody:p.texto}))
 const images=[]
 for(let i=0;i<pages.length;i++){
  const content={...c,design:{...c.design,...(i===0&&s.slides[0]?{subline:s.slides[0].texto}:{})},...(i===0?{texto_en_imagen:s.slides[0]?.titulo||s.titular}:{}),...(i===3?{ctaVisual:s.slides[3].titulo}:{}),endBody:s.slides[3]?.texto}
  const r=await renderFeed(content,pages[i],sharp,fs,join(dir,'brand'))
  const name=`pagina-${i+1}.jpg`,path=join(dir,'artifacts',name)
  await writeFile(path,r.buffer)
  const m=await sharp(path).metadata();if(m.width!==1080||m.height!==(s.tipo==='historia_social'?1920:1350)||m.format!=='jpeg')throw Error('Dimensiones de salida inválidas')
  images.push({index:i+1,filename:name,sha256:hash(r.buffer),bytes:r.buffer.length,width:m.width,height:m.height,validation:r.validation})
 }
 const manifest={kind:s.tipo,guion:s,caption:s.caption,images,photo:{id:photo.id,review:photo.review,ocr},editorial_review:'Revisar el resultado y el caption antes de publicar; controles técnicos no prueban afirmaciones comerciales.',published:false}
 await writeFile(join(dir,'artifacts','manifest.json'),JSON.stringify(manifest,null,2)+'\n')
 return {manifest_filename:'manifest.json',images,content_type:'image/jpeg',width:1080,height:s.tipo==='historia_social'?1920:1350,caption:s.caption}
}
