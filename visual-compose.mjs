import {composeStory} from './story-compose.mjs';
import './fontconfig.mjs';
import sharp from 'sharp';
import {visualDirection} from './visual-directions.mjs';
const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function wrap(value,size,width,max){const out=[];for(const word of String(value||'').split(/\s+/)){const next=out.length?out.at(-1)+' '+word:word;const m=await sharp({text:{text:e(next),font:'Montserrat Bold '+size,rgba:true}}).metadata();if(m.width>width&&out.length)out.push(word);else if(out.length)out[out.length-1]=next;else out.push(word)}if(out.length>max)throw Error('Acorta el texto para esta composición');for(const t of out){const m=await sharp({text:{text:e(t),font:'Montserrat Bold '+size,rgba:true}}).metadata();if(m.width>width)throw Error('Texto demasiado ancho')}return out}
export async function composeVisual({bytes,logo,brand,style,headline,subline,cta,width=1080,height=1350,points=[],page='',storyHour}){
 if(height/width>1.65)return composeStory({bytes,logo,brand,style,headline,subline,cta,width,height,points,storyHour});
 const d=visualDirection(style),navy=/^#[a-f\d]{6}$/i.test(brand.primary)?brand.primary:'#14233b',accent=/^#[a-f\d]{6}$/i.test(brand.accent)?brand.accent:'#ff6b35',fg=d.dark?'#ffffff':navy,bg=d.dark?navy:'#f8f3e9',story=height/width>1.65,top=story?180:48,foot=story?height-410:height-240;
 const scale=width/1080; // Layout in 1080-wide coordinates; resize only the final vector.
 const H=height/scale,T=top/scale,F=foot/scale;
 const title=await wrap(headline,64,920,3),body=await wrap(subline,29,920,4),action=await wrap(cta,30,840,2);
 const logoBytes=await sharp(logo).resize(290,72,{fit:'inside'}).png().toBuffer();
 const wrappedPoints=await Promise.all(points.map(p=>wrap(p,27,920,2))),pointsHeight=wrappedPoints.reduce((n,p)=>n+p.length*39+12,0);
 const yTitle=T+160,yPhoto=yTitle+title.length*76+24,yBody=F-36-body.length*40-pointsHeight,photoH=yBody-yPhoto-36;
 if(photoH<140)throw Error('Demasiado contenido para el formato; acorta título o explicación');
 const photo=await sharp(bytes).resize(920,Math.round(photoH),{fit:'contain',background:bg}).png().toBuffer();
 const tx=(ls,x,y,size,color=fg,weight=700)=>ls.map((s,i)=>`<text x="${x}" y="${y+i*(size+12)}" font-family="Montserrat" font-size="${size}" font-weight="${weight}" fill="${color}">${e(s)}</text>`).join('');
 let decoration=d.id==='papel-editorial'?`<path d="M30 35L1020 48L1040 ${H-30}L40 ${H-50}Z" fill="#eee2cc"/><path d="M60 62L1045 38L1005 ${H-65}L34 ${H-28}Z" fill="${bg}"/>`:d.id==='tecnologica'?`<path d="M1040 240V${H-320}H700" fill="none" stroke="${accent}" stroke-width="9"/>`:d.id==='restaurante-3d'?`<ellipse cx="540" cy="${yPhoto+photoH*.8}" rx="460" ry="150" fill="#eadfcb"/>`:d.id==='editorial-impacto'?`<rect y="${yTitle-70}" width="1080" height="${title.length*76+10}" fill="${accent}"/>`:`<rect x="80" y="${yTitle-94}" width="145" height="7" fill="${accent}"/>`;
 let extra='',pointY=yBody+body.length*40+35;for(const p of wrappedPoints){extra+=tx(p,80,pointY,27);pointY+=p.length*39+12}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1080 ${H}"><rect width="1080" height="${H}" fill="${bg}"/>${decoration}<rect x="80" y="${T}" width="330" height="94" rx="14" fill="${navy}"/><image href="data:image/png;base64,${logoBytes.toString('base64')}" x="100" y="${T+11}" width="290" height="72"/>${tx(title,80,yTitle,64)}<image href="data:image/png;base64,${photo.toString('base64')}" x="80" y="${yPhoto}" width="920" height="${photoH}"/>${tx(body,80,yBody,29,fg,500)}${extra}<rect x="80" y="${F}" width="920" height="${action.length*42+32}" rx="16" fill="${accent}"/>${tx(action,112,F+45,30,'white')} ${tx([(brand.website||brand.contact||'').replace('https://','')],80,F+action.length*42+78,23)}${tx(['Escena ilustrativa'+(page?' · '+page:'')],80,F+action.length*42+114,17)}</svg>`;
 return sharp(Buffer.from(svg)).png().toBuffer();
}
