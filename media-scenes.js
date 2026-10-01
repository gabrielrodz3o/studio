// Escenas de marca y recursos propios; el reproductor conserva el video al cambiar de cuadro.
(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const priorSeek=window.seek,priorPrepare=window.preparar;let story={},players=new Map();
const measure=document.createElement('canvas').getContext('2d');
const lines=(s,width,size,weight)=>{measure.font=`${weight} ${size}px Montserrat`;const a=[];let line='';for(const word of String(s||'').split(/\s+/)){if(!word)continue;const candidate=line?line+' '+word:word;if(measure.measureText(candidate).width<=width){line=candidate;continue}if(line)a.push(line);line='';for(const char of word){if(measure.measureText(line+char).width>width&&line){a.push(line);line=''}line+=char}}if(line)a.push(line);return a};
window.preparar=async sb=>{story=sb;await priorPrepare(sb);const logo=sb.brand?.logo_url||(sb.brand?.logo_resource_id?'/api/library/'+sb.brand.logo_resource_id:null);if(logo){const image=new Image();image.src=logo;await image.decode()}for(const v of players.values())v.remove();players.clear();for(const e of sb.escenas){if(e.tipo!=='media')continue;const url=e.media_url||(e.resource_id?'/api/library/'+e.resource_id:null);if(!url)continue;if(e.media_kind==='video'){const v=document.createElement('video');v.src=url;v.muted=true;v.preload='auto';v.playsInline=true;v.style.cssText='position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover;display:none;pointer-events:none';document.body.insertBefore(v,document.body.firstChild);await new Promise((ok,no)=>{v.onloadedmetadata=ok;v.onerror=()=>no(Error('No se pudo cargar el clip'));if(v.readyState>=1)ok()});players.set(url,v)}else{const img=new Image();img.src=url;await img.decode()}}return true};
window.seek=async t=>{priorSeek(t);let start=0,scene;for(const e of story.escenas||[]){if(t<start+e.dur){scene=e;break}start+=e.dur}scene||=story.escenas?.at(-1);for(const v of players.values())v.style.display='none';if(!scene)return;
const stage=document.querySelector('#stage');let html='';const b=story.brand||{name:'ComandPOS',primary:'#14233b',accent:'#ff6b35'},edit=scene.design||{},x=edit.x??80,y=edit.y??(scene.layout&&stage.viewBox.baseVal.height>1500?650:450),size=edit.size??72;
if(scene.tipo==='media'){
const url=scene.media_url||(scene.resource_id?'/api/library/'+scene.resource_id:null),v=players.get(url),wide=stage.getAttribute('viewBox')==='0 0 1920 1080',height=stage.viewBox.baseVal.height,width=stage.viewBox.baseVal.width;
if(v){v.style.display='block';v.style.width=width+'px';v.style.height=height+'px';v.style.objectFit=scene.fit||'cover';v.style.objectPosition=`${scene.focus_x??50}% ${scene.focus_y??50}%`;const target=Math.max(0,Math.min((scene.clip_start||0)+t-start,v.duration-.04));if(Math.abs(v.currentTime-target)>.005)await new Promise((ok,no)=>{const timer=setTimeout(()=>{v.removeEventListener('seeked',done);no(Error('El clip no pudo posicionarse'))},5000);function done(){clearTimeout(timer);ok()}v.addEventListener('seeked',done,{once:true});v.currentTime=target})}
html=`<rect width="${width}" height="${height}" fill="${v?'transparent':esc(b.primary)}"/>`;
if(url&&!v)html+=`<image href="${esc(url)}" width="${width}" height="${height}" preserveAspectRatio="${scene.fit==='contain'?'xMidYMid meet':'xMidYMid slice'}"/>`;
const elapsed=Math.max(0,t-start),enter=1-Math.pow(1-Math.min(1,elapsed/.65),3),progress=Math.min(1,elapsed/scene.dur),layout=scene.layout;
if(layout&&!url){
 const accent=esc(b.accent),primary=esc(b.primary),cx=width*.82+Math.sin(elapsed*.7)*30,cy=height*.27;
 html+=`<circle cx="${cx}" cy="${cy}" r="${width*.33}" fill="${accent}" opacity=".14"/><circle cx="${width*.15}" cy="${height*.72}" r="${width*.27}" fill="white" opacity=".035"/>`;
 if(layout==='cards')html+=`<rect x="60" y="245" width="${width-120}" height="${height-535}" rx="38" fill="white" opacity=".09"/>`;
 if(layout==='split')html+=`<path d="M ${width*.75} 210 L ${width*.53} ${height-270}" stroke="${accent}" stroke-width="16" opacity=".55"/>`;
 if(layout==='minimal')html+=`<rect x="80" y="265" width="${80+130*enter}" height="12" rx="6" fill="${accent}"/>`;
 if(layout==='question')html+=`<text x="${width-260}" y="380" fill="${accent}" opacity=".35" font-size="230" font-family="Montserrat" font-weight="900">?</text>`;
 if(layout==='steps'||layout==='cards')html+=`<rect x="80" y="235" width="155" height="78" rx="22" fill="${accent}"/><text x="108" y="289" fill="white" font-size="38" font-family="Montserrat" font-weight="800">${scene.step||1} / ${scene.steps||4}</text>`;
 html+=`<rect x="80" y="${height-270}" height="7" width="${(width-160)*progress}" rx="3" fill="${accent}"/>`;
}
html+=`<rect width="${width}" height="${height}" fill="black" opacity="${scene.shade??.35}"/><text x="80" y="150" fill="white" font-size="34" font-family="Montserrat" font-weight="800">${esc(b.name)}</text>`;
html+=`<g opacity="${layout?enter:1}" transform="translate(0 ${layout?(1-enter)*35:0})">`;
lines(scene.titulo,width-x-80,size,900).forEach((line,i)=>html+=`<text x="${x}" y="${y+i*size*1.12}" fill="white" font-size="${size}" font-family="Montserrat" font-weight="900">${esc(line)}</text>`);
html+='</g>';
lines(scene.texto,width-160,36,600).forEach((line,i)=>html+=`<text x="80" y="${(layout&&height>1500?1100:height-440)+i*43}" fill="white" font-size="36" font-family="Montserrat" font-weight="600">${esc(line)}</text>`);
html+=`<rect x="80" y="${height-235}" width="${width-160}" height="5" fill="${esc(b.accent)}"/><text x="80" y="${height-160}" fill="white" font-size="30" font-family="Montserrat">${esc(scene.cta||b.cta)}</text>`;
if(b.logo_url||b.logo_resource_id){html+=`<rect x="60" y="70" width="650" height="115" fill="${esc(b.primary)}"/><image href="${esc(b.logo_url||'/api/library/'+b.logo_resource_id)}" x="80" y="85" width="350" height="90" preserveAspectRatio="xMinYMid meet"/>`}
if(story.subtitulos)html+=window.subtitulosCineticos(scene,t-start,height-330);stage.innerHTML=html;
}else if(scene.design){const texts=[...stage.querySelectorAll('text')];for(const el of texts){if(Number(el.getAttribute('font-size'))>=64&&el.getAttribute('y')<650){el.setAttribute('transform',`translate(${edit.dx||0} ${edit.dy||0}) scale(${edit.scale||1})`)}}}
if(scene.overlay){const o=scene.overlay;const ns='http://www.w3.org/2000/svg',el=document.createElementNS(ns,'text');for(const [k,v]of Object.entries({x:o.x,y:o.y,fill:o.color||'#ffffff','font-size':o.size||48,'font-family':'Montserrat','font-weight':800}))el.setAttribute(k,v);el.textContent=o.text;stage.append(el)}
};
})();
