import './fontconfig.mjs';
import sharp from 'sharp';
import {visualDirection} from './visual-directions.mjs';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function lines(value,size,max){const out=[];for(const word of String(value||'').split(/\s+/)){const next=out.length?out.at(-1)+' '+word:word;const m=await sharp({text:{text:esc(next),font:'Montserrat Bold '+size,rgba:true}}).metadata();if(m.width>920&&out.length)out.push(word);else if(out.length)out[out.length-1]=next;else out.push(word)}if(out.length>max)throw Error('Acorta el texto de la historia: '+value);for(const line of out){const m=await sharp({text:{text:esc(line),font:'Montserrat Bold '+size,rgba:true}}).metadata();if(m.width>920)throw Error('Texto demasiado ancho para historia')}return out}
// Mobile-first 9:16. All meaningful text stays between y=180 and y=1640.
export async function composeStory({bytes,logo,brand,style,headline,subline,cta,points=[],storyHour,width=1080,height=1920}){
 const d=visualDirection(style),navy=/^#[a-f\d]{6}$/i.test(brand.primary)?brand.primary:'#14233b',accent=/^#[a-f\d]{6}$/i.test(brand.accent)?brand.accent:'#ff6b35',bg=d.dark?navy:'#f8f3e9',fg=d.dark?'white':navy;
 const title=await lines(headline,68,3),body=await lines(subline,34,4),action=await lines(cta,32,2),tip=points[0]?await lines(points[0],30,2):[];
 const pictureTop=360+title.length*80,pictureBottom=1190,pictureHeight=pictureBottom-pictureTop;
 const base=await sharp(bytes).resize(1080,pictureHeight,{fit:'cover'}).blur(22).modulate({brightness:d.dark?.52:.85}).png().toBuffer();
 const foreground=await sharp(bytes).resize(920,pictureHeight,{fit:'inside'}).png().toBuffer(),meta=await sharp(foreground).metadata();
 const mark=await sharp(logo).resize(270,68,{fit:'inside'}).png().toBuffer();
 const text=(ls,x,y,size,color=fg,weight=700)=>ls.map((s,i)=>`<text x="${x}" y="${y+i*(size+12)}" font-family="Montserrat" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`).join('');
 const label=storyHour===13?'UNA IDEA PARA TU NEGOCIO':storyHour===18?'CONOCE CÓMO FUNCIONA':'UNA IDEA PARA TI';
 let shapes=d.id==='papel-editorial'?`<path d="M20 320L45 400L22 510L42 650L24 830L45 1020L22 1200L45 1370" stroke="${accent}" stroke-width="14" fill="none"/>`:d.id==='editorial-impacto'?`<rect x="0" y="320" width="28" height="${title.length*80+40}" fill="${accent}"/>`:`<rect x="80" y="300" width="130" height="6" fill="${accent}"/>`;
 const tipY=1234+body.length*46+20;
 if(tipY+Math.max(0,tip.length-1)*42>1460)throw Error('La historia necesita menos texto para conservar la zona segura');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="${bg}"/>${shapes}<rect x="80" y="180" width="310" height="88" rx="16" fill="${navy}"/><image href="data:image/png;base64,${mark.toString('base64')}" x="100" y="190" width="270" height="68"/>${text([label],80,292,21,fg)}${text(title,80,375,68)}<image href="data:image/png;base64,${base.toString('base64')}" x="0" y="${pictureTop}" width="1080" height="${pictureHeight}"/><image href="data:image/png;base64,${foreground.toString('base64')}" x="${(1080-meta.width)/2}" y="${pictureTop+(pictureHeight-meta.height)/2}" width="${meta.width}" height="${meta.height}"/>${text(body,80,1234,34,fg,500)}${text(tip,80,tipY,30,fg,800)}<rect x="80" y="1490" width="920" height="${action.length===1?78:112}" rx="20" fill="${accent}"/>${text(action,100,1540,32,'white',800)}${text([(brand.website||brand.contact||'').replace('https://','')],80,1640,23)}${text(['Escena ilustrativa'],80,1672,17)}</svg>`;
 return sharp(Buffer.from(svg)).png().toBuffer();
}
