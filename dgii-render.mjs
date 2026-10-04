import './fontconfig.mjs';
import sharp from 'sharp';import {readFile,writeFile} from 'node:fs/promises';import{join}from'node:path';import{createHash}from'node:crypto';import{dgiiContent,DGII_CHECKLIST,DGII_REQUIREMENTS}from'./dgii-content.mjs';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateDgii(s){if(!s.dgii)return;const p=dgiiContent(s.dgii.date);if(s.tipo!=='carrusel'||s.brand_id!=='comandpos'||JSON.stringify(p)!==JSON.stringify(s.dgii)||s.slides.length!==3)throw Error('Contenido DGII alterado o fuera de vigencia')}
// Measure actual font widths; long daily topics must fail visibly, never run off the image.
export async function dgiiText(value,x,y,{size=32,width=920,color='#14233b',weight=600,maxLines=3}={}){
 const lines=[];for(const word of String(value).split(/\s+/)){const candidate=lines.length?lines.at(-1)+' '+word:word;const m=await sharp({text:{text:e(candidate),font:`Montserrat Bold ${size}`,rgba:true}}).metadata();if(m.width>width&&lines.length)lines.push(word);else if(lines.length)lines[lines.length-1]=candidate;else lines.push(word)}
 if(lines.length>maxLines)throw Error('Texto DGII excede su espacio: '+value);
 for(const line of lines){const m=await sharp({text:{text:e(line),font:`Montserrat Bold ${size}`,rgba:true}}).metadata();if(m.width>width)throw Error('Texto DGII demasiado ancho')}
 return lines.map((line,i)=>`<text x="${x}" y="${y+i*(size+12)}" font-family="Montserrat" font-size="${size}" font-weight="${weight}" fill="${color}">${e(line)}</text>`).join('');
}
export async function executeDgii(s,dir){
 validateDgii(s);const b=JSON.parse(await readFile(join(dir,'brand-profile.json'))),p=s.dgii,images=[],navy=b.primary,orange=b.accent,visible=[];
 const photo=await sharp(await readFile(join(dir,'brand-photo'))).resize(920,470,{fit:'cover',position:'centre'}).png().toBuffer(),logo=await sharp(await readFile(join(dir,'brand-logo'))).resize(300,80,{fit:'inside'}).png().toBuffer();
 const text=async(value,x,y,opts={})=>{visible.push(value);return dgiiText(value,x,y,{color:navy,...opts})};
 const count=p.days_left===0?'Hoy vence el plazo':p.days_left===1?'Falta 1 día':`Faltan ${p.days_left} días`;
 for(let i=0;i<3;i++){
 let body='';visible.length=0;
 if(i===0){
 body=await text('FACTURACIÓN',80,242,{size:72,weight:900,maxLines:1})+await text('ELECTRÓNICA',80,325,{size:72,weight:900,color:orange,maxLines:1});
 body+=`<rect x="80" y="370" width="920" height="270" rx="24" fill="${navy}"/>`;
 body+=await text(p.days_left===0?'HOY VENCE':p.days_left===1?'FALTA':'FALTAN',112,416,{size:28,color:'white',maxLines:1});
 body+=await text(String(p.days_left),105,602,{size:176,color:'white',weight:900,width:370,maxLines:1});
 body+=await text(p.days_left===1?'DÍA':'DÍAS',485,510,{size:61,color:'white',weight:900,width:420,maxLines:1});
 body+=await text('15 NOVIEMBRE 2026',485,567,{size:27,color:'white',width:445,maxLines:1});
 body+=await text('Plazo para pequeños, micros y no clasificados.',80,692,{size:29,maxLines:1});
 body+=`<image href="data:image/png;base64,${photo.toString('base64')}" x="80" y="725" width="920" height="300" preserveAspectRatio="xMidYMid meet"/>`;
 body+=await text('Prepara tu negocio para facturar electrónicamente.',80,1080,{size:30,weight:800,maxLines:1})+await text('Desliza: requisitos clave y una acción para hoy.',80,1140,{size:29,maxLines:1});
 }
 if(i===1){
 body=await text('Cómo emitir facturas electrónicas',80,238,{size:43,weight:900,maxLines:1})+await text('Puntos clave para la facturación electrónica',80,295,{size:29,maxLines:1});
 for(const [k,step]of DGII_CHECKLIST.entries()){const y=345+k*177;body+=`<rect x="80" y="${y}" width="920" height="156" rx="20" fill="#f4f6f9"/><circle cx="126" cy="${y+45}" r="23" fill="${orange}"/>`+await text(String(k+1),118,y+53,{size:22,color:'white',width:32,maxLines:1})+await text(step.title,172,y+46,{size:32,weight:800,width:785,maxLines:1})+await text(step.body,172,y+89,{size:25,weight:500,width:775,maxLines:2});}
 body+=await text('Consulta el procedimiento completo en dgii.gov.do',80,1119,{size:28,maxLines:1})+await text('Confirma tu caso con la DGII y tu contador.',80,1164,{size:27,maxLines:1});
 }
 if(i===2){
 body=await text('FACTURACIÓN ELECTRÓNICA',80,213,{size:26,color:orange,weight:800,maxLines:1})+await text('La preparación también es operativa.',80,276,{size:39,weight:800,maxLines:1})+await text(p.title,80,350,{size:43,weight:900,maxLines:2});
 for(const [k,point]of p.points.entries()){const y=468+k*110;body+=`<circle cx="110" cy="${y-8}" r="20" fill="${orange}"/>`+await text(String(k+1),103,y,{size:20,color:'white',width:30,maxLines:1})+await text(point,154,y,{size:32,width:820,maxLines:2});}
 body+=`<rect x="80" y="810" width="920" height="353" rx="24" fill="${navy}"/>`+await text('Organiza pedidos, mesas y cuentas',112,871,{size:35,color:'white',width:850,weight:800,maxLines:1})+await text('con ComandPOS.',112,920,{size:35,color:'white',maxLines:1})+await text('Solicita una demo de estas funciones.',112,983,{size:28,color:'white',width:850,maxLines:1})+`<rect x="112" y="1020" width="856" height="69" rx="16" fill="${orange}"/>`+await text('+1 849 540 6093 · comandpos.com',145,1065,{size:28,color:'white',width:790,maxLines:1})+await text('La demo no sustituye la autorización fiscal de la DGII.',112,1131,{size:22,color:'white',width:850,maxLines:1});
 }
 const footer=await text(i===0?'DGII · Aviso 06-26 · Verifica tu clasificación.':i===1?'Fuente: DGII · Autorización para ser Emisor Electrónico.':'Guía informativa · Revisa tu proceso fiscal con tu contador.',80,1244,{size:21,width:920,maxLines:1})+await text('GCODE · Contenido informativo; no es una comunicación oficial de DGII.',80,1282,{size:19,width:920,maxLines:1});
 const decor=s.visual_style?.id==='papel-editorial'?`<path d="M20 180L52 230L25 300L52 380L22 460L50 600L25 780L50 940L25 1110L50 1280" stroke="${orange}" stroke-width="16" fill="none"/>`:s.visual_style?.id==='tecnologica'?`<path d="M1035 170V1190H1010" stroke="${orange}" stroke-width="8" fill="none"/>`:s.visual_style?.id==='editorial-impacto'?`<rect x="0" y="170" width="28" height="1010" fill="${orange}"/>`:'';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="${s.visual_style?.id==='papel-editorial'||s.visual_style?.id==='restaurante-3d'?'#f8f3e9':'white'}"/>${decor}<rect x="70" y="40" width="360" height="100" rx="18" fill="${navy}"/><image href="data:image/png;base64,${logo.toString('base64')}" x="100" y="50" width="300" height="80"/><text x="1000" y="99" text-anchor="end" font-family="Montserrat" font-size="22" font-weight="700" fill="${navy}">GUÍA PARA TU NEGOCIO · RD</text>${body}<rect x="80" y="1203" width="920" height="3" fill="${orange}"/>${footer}<text x="1000" y="1320" text-anchor="end" font-family="Montserrat" font-size="20" fill="${navy}">${i+1}/3</text></svg>`;
 const bytes=await sharp(Buffer.from(svg)).jpeg({quality:95}).toBuffer(),filename='pagina-'+(i+1)+'.jpg';await writeFile(join(dir,'artifacts',filename),bytes);images.push({index:i+1,filename,width:1080,height:1350,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),visible_text:[...visible]});
 }
 await writeFile(join(dir,'artifacts/manifest.json'),JSON.stringify({guion:s,caption:s.caption,images,sources:[p.source,DGII_REQUIREMENTS],design_version:s.dgii_design_version||2,visual_style:s.visual_style||null,review:'pending'}));return{manifest_filename:'manifest.json',images,width:1080,height:1350,caption:s.caption,content_type:'image/jpeg'};
}
