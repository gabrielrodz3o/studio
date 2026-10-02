import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
// Coordinates are in original screenshots. These regions were inspected; no invented UI.
export const videoEvidence={
 cocina:{label:'Comandas en cocina',crop:[0,60,815,550],detail:[825,100,400,600],focus:[0,0,400,470],labels:['Productos y modificadores','Detalle de la comanda'],claims:['La pantalla muestra productos, cantidades y modificadores de las comandas.','Las comandas se organizan por su estado visible.']},
 mesas:{label:'Gestión del salón',crop:[0,140,850,620],detail:[0,140,425,215],focus:[0,0,425,215],labels:['Vista del salón','Estado de las mesas'],claims:['La vista muestra mesas y sus estados.','Las tarjetas muestran la asignación visible de las mesas.']},
 cuenta:{label:'Detalle de la cuenta',crop:[0,140,915,650],detail:[0,220,915,300],focus:[0,80,915,300],labels:['Cuenta de mesa','Productos y cantidades'],claims:['La cuenta muestra productos, cantidades y valores.','Es posible consultar el detalle de la cuenta.']},
 reporteBI:{label:'Reportes del negocio',crop:[0,0,811,137],detail:[0,389,1073,402],focus:[0,0,811,137],labels:['Venta bruta y neta','Desglose del reporte'],claims:['El reporte distingue venta bruta y venta neta.','El reporte muestra costo de receta y mermas.']}
};
export function editorialVideoStyle(history=[],brandId='comandpos'){
 const rotation=['comercial','historia','tutorial'];
 const previous=history.filter(h=>h.brand_id===brandId&&(h.kind==='video'||(!h.kind&&['comercial','historia'].includes(h.style))))
  .sort((a,b)=>String(b.at||'').localeCompare(String(a.at||''))).find(h=>rotation.includes(h.style));
 return previous?rotation[(rotation.indexOf(previous.style)+1)%rotation.length]:'comercial';
}
export async function editorialVideo(plan,root,{style='comercial'}={}){
 if(!['comercial','historia','tutorial'].includes(style))throw Error('Estilo editorial sin composición verificada: '+style);
 const preset=videoEvidence[plan.asset];if(!preset)throw Object.assign(Error('No hay captura verificada para demostrar este tema en video'),{code:'EDITORIAL_EVIDENCE_REQUIRED'});
 const bytes=await readFile(join(root,'feed/brand',plan.asset+'.webp')).catch(e=>{if(e.code==='ENOENT')throw Error('Falta la captura del módulo '+plan.asset);throw e});
 const meta=await sharp(bytes).metadata(),digest=createHash('sha256').update(bytes).digest('hex'),image='assets/editorial-'+digest.slice(0,20)+'.webp';
 const evidence={...structuredClone(preset),key:plan.asset,imagen:image,ancho:meta.width,alto:meta.height,steps:['Plantea una pregunta','Consulta la pantalla',''],benefit:'',source_sha256:digest,source:'Captura local: feed/brand/'+plan.asset+'.webp'};
 if(plan.asset==='reporteBI'&&/merma|desperdicio/i.test(plan.title)){Object.assign(evidence,{label:'Mermas del negocio',crop:[0,700,356,101],detail:[0,700,356,101],focus:[0,0,356,101],labels:['Mermas registradas','Dato de ejemplo'],claims:['El reporte muestra una tarjeta Mermas (desperdicio).']})}
 else if(plan.asset==='reporteBI'&&/receta|plato|ingrediente/i.test(plan.title)){Object.assign(evidence,{label:'Costo de receta',crop:[362,493,354,99],detail:[362,493,354,99],focus:[0,0,354,99],labels:['Costo de receta','Dato de ejemplo'],claims:['El reporte muestra una tarjeta Costo de Receta.']})}
 for(const k of ['crop','detail']){const [x,y,w,h]=evidence[k];if(x+w>meta.width||y+h>meta.height)throw Error('La captura cambió de dimensiones; revisar sus recortes')}
 await mkdir(join(root,'.studio-state/editorial-assets'),{recursive:true});await writeFile(join(root,'.studio-state/editorial-assets',image.split('/').at(-1)),bytes,{mode:0o600});await mkdir(join(root,'assets'),{recursive:true});await writeFile(join(root,image),bytes,{mode:0o600});
 const original={nombre:'editorial-comercial',formato:'comercial',perfil_voz:'n8n',voz:true,subtitulos:true,editorial:plan,evidencia:evidence,escenas:[
 {tipo:'comercial_n8n',rol:'gancho',dur:4,titulo:plan.title.slice(0,64),etiqueta:'CASO ILUSTRATIVO',voz:''},
 {tipo:'comercial_n8n',rol:'detalle',dur:6,titulo:evidence.labels[1],etiqueta:'PRODUCTO',voz:''},
 {tipo:'comercial_n8n',rol:'cierre',dur:4,titulo:plan.cta,etiqueta:'COMANDPOS',voz:''}
 ]};
 if(style==='comercial')return original;
 const shot=(crop,title,step)=>({tipo:'producto_paso',dur:5,titulo:title,etiqueta:'CAPTURA REAL',step,steps:2,imagen:image,ancho:meta.width,alto:meta.height,recorte:crop,voz:''});
 const shots=[shot(evidence.crop,evidence.labels[0],1),shot(evidence.detail,evidence.labels[1],2)];
 const closing={tipo:'cierre',dur:4,cta:plan.cta,whatsapp:'+1 849 540 6093',web:'comandpos.com',voz:''};
 if(style==='tutorial')return {...original,nombre:'editorial-recorrido',formato:style,escenas:[...shots,closing]};
 const situations={cocina:['¿Era sin cebolla?','¿Qué recibió cocina?'],mesas:['¿Cuál mesa está ocupada?','Consulta el salón.'],cuenta:['¿Qué incluye la cuenta?','Revisa sus productos.'],reporteBI:['¿Qué cifra estás viendo?','Revisa qué incluye.']};
 return {...original,nombre:'editorial-historia',formato:style,escenas:[
 {tipo:'gancho_local',dur:4,rotulo:plan.title.slice(0,60),sub:'Una situación ilustrativa.',voz:''},
 {tipo:'caos_acumulado',dur:4,rotulo:'Un detalle merece atención.',frases:situations[plan.asset],voz:''},
 ...shots,
 {tipo:'remate',dur:3,sin_reparto:true,lineas:['Consulta el detalle.','*Antes de decidir.*'],voz:''},closing]};
}
