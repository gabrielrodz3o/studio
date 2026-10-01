// Module loaded before first render; render.mjs waits for studioVisualReady.
import {resolveDesign} from './design.mjs';
import {captionSVG,captionPages} from './captions.mjs';
const ctx=document.createElement('canvas').getContext('2d');
window.studioDesign=resolveDesign;
window.studioCaption=(words,time,story={},width=1080,height=1920,y,legacySize)=>{const d=resolveDesign(story.brand,width,height,story.template?.params);return captionSVG(words,time,{width,y:y??height-d.bottom-65,font:d.font,size:!d.modern&&legacySize?legacySize:d.caption_size,mode:d.subtitle,maxLines:d.caption_lines,gap:d.caption_gap,maxSeconds:d.caption_max_seconds,minSeconds:d.caption_min_seconds,maxCps:d.caption_cps,accent:story.brand?.accent||'#ff6b35',measure:(s,size,font)=>{ctx.font=`800 ${size}px "${font}"`;return ctx.measureText(s).width}})};
window.studioVisualReady=true;
const baseSeek=window.seek;
window.seek=async t=>{await baseSeek(t);const story=window.currentStoryboard||{};let start=0;const scene=story.escenas?.find(s=>{const hit=t>=start&&t<start+s.dur;start+=s.dur;return hit});if(scene?.tipo==='media')return;const stage=document.querySelector('#stage'),w=stage.viewBox.baseVal.width,h=stage.viewBox.baseVal.height,d=resolveDesign(story.brand,w,h,story.template?.params);if(!d.modern)return;if(scene?.tipo==='comercial_n8n'&&(w!==1080||h!==1920)){stage.innerHTML=commercialResponsive(story,scene,t-(start-scene.dur),w,h,d);return}const scale=Math.min(1,(h-d.top-d.bottom)/h),x=(w-w*scale)/2;let content=stage.innerHTML.replaceAll('font-family="Montserrat"',`font-family="${d.font}"`);if(story.brand?.accent)content=content.replaceAll('#FF6B35',story.brand.accent);stage.innerHTML=`<rect width="${w}" height="${h}" fill="${story.brand?.primary||'#14233b'}"/><g transform="translate(${x},${d.top}) scale(${scale})">${content}</g>`};

window.studioCaptionMetrics=(words,story,width,height,legacySize)=>{const d=resolveDesign(story.brand,width,height,story.template?.params),size=!d.modern&&legacySize?legacySize:d.caption_size;ctx.font=`800 ${size}px "${d.font}"`;const pages=captionPages(words,{measure:s=>ctx.measureText(s).width,maxWidth:width-160,maxLines:d.caption_lines,gap:d.caption_gap,maxSeconds:d.caption_max_seconds,minSeconds:d.caption_min_seconds,maxCps:d.caption_cps});return {pages:pages.length,fast:pages.filter(p=>p.fast).length,tooShort:pages.filter(p=>p.tooShort).length}};

// Native composition for non-vertical commercial exports: do not shrink a Reel
// and its captions into a narrow side panel.
function commercialResponsive(story,scene,time,w,h,d){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),margin=72,accent=story.brand?.accent||'#ff6b35',primary=story.brand?.primary||'#14233b',e=story.evidencia;
 const size=w>h?72:64;ctx.font=`900 ${size}px Montserrat`;const lines=[];for(const word of String(scene.titulo||'ComandPOS').split(/\s+/)){if(lines.length&&ctx.measureText(lines.at(-1)+' '+word).width<w-margin*2)lines[lines.length-1]+=' '+word;else lines.push(word)}
 const titleY=d.top+155,captionY=h-d.bottom-60,captionTop=captionY-d.caption_size*2.4,cardY=titleY+(lines.length-1)*size*1.12+45,cardH=Math.max(80,captionTop-cardY-48),crop=scene.rol==='detalle'?e.detail:e.crop;
 let html=`<rect width="${w}" height="${h}" fill="${esc(primary)}"/><circle cx="${w*.85+Math.sin(time)*10}" cy="${h*.45}" r="${w*.42}" fill="${esc(accent)}" opacity=".06"/><image href="${esc(story.brand?.logo_url||'assets/n8n-logo.png')}" x="${margin}" y="${d.top}" width="310" height="65" preserveAspectRatio="xMinYMid meet"/><rect x="${margin}" y="${d.top+85}" width="${w-margin*2}" height="4" fill="${esc(accent)}"/>`;
 html+=lines.map((line,i)=>`<text x="${margin}" y="${titleY+i*size*1.12}" font-family="Montserrat" font-size="${size}" font-weight="900" fill="white">${esc(line)}</text>`).join('');
 html+=`<rect x="${margin}" y="${cardY}" width="${w-margin*2}" height="${cardH}" rx="20" fill="white"/><svg x="${margin+12}" y="${cardY+12}" width="${w-margin*2-24}" height="${cardH-24}" viewBox="${crop.join(' ')}" preserveAspectRatio="xMidYMid meet" style="overflow:hidden"><defs><clipPath id="commercial-evidence"><rect x="${crop[0]}" y="${crop[1]}" width="${crop[2]}" height="${crop[3]}"/></clipPath></defs><image clip-path="url(#commercial-evidence)" href="${esc(e.imagen)}" width="${e.ancho}" height="${e.alto}"/></svg>`;
 if(story.subtitulos)html+=window.studioCaption(scene.palabras||[],time-(scene.voz_inicio??.35),story,w,h,captionY);
 html+=`<text x="${margin}" y="${h-d.bottom-5}" font-family="Montserrat" font-size="22" fill="#b6c4d8">${esc(scene.rol==='problema'?'Caso ilustrativo · Datos de ejemplo':'Producto real · Datos de ejemplo')} · ${esc(story.brand?.website||'comandpos.com')}</text>`;
 return html;
}
