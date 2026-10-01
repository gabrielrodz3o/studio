// Adaptado del renderizador del Reel de referencia. Sin dependencias del servidor.
(()=>{
const W=1080,H=1920,FPS=30,NAVY='#0B1A2E',ORANGE='#FF6B35',CYAN='#35D0E8',WHITE='#FFFFFF',MUTED='#9FB6C8';
const FONT='Montserrat';
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const clamp=x=>Math.max(0,Math.min(1,x));
const easeOut=x=>1-Math.pow(1-clamp(x),3);
const easeInOut=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
const back=x=>{x=clamp(x);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const T=(s,x,y,size,fill=WHITE,weight=800,extra='')=>`<text x="${x}" y="${y}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" fill="${fill}" ${extra}>${xml(s)}</text>`;
const R=(x,y,w,h,fill,r=24,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
function widthOf(s,size,weight=900){const ctx=widthOf.ctx||(widthOf.ctx=document.createElement('canvas').getContext('2d'));ctx.font=`${weight} ${size}px Montserrat`;return ctx.measureText(s).width;}
function wrap(s,size,max,weight){const out=[];for(const w of String(s).split(/\s+/).filter(Boolean)){if(out.length&&widthOf(out.at(-1)+' '+w,size,weight)<=max)out[out.length-1]+=' '+w;else out.push(w);}return out;}
function background(t,variant){const a=[['#FF6B35','#35D0E8'],['#35D0E8','#7C5CFF'],['#FF6B35','#FFB23F']][variant%3];
 const x1=260+Math.sin(t*.45)*140,y1=520+Math.cos(t*.35)*120,x2=860+Math.cos(t*.4)*120,y2=1380+Math.sin(t*.3)*140;
 return `<defs><radialGradient id="o1"><stop stop-color="${a[0]}" stop-opacity=".30"/><stop offset="1" stop-color="${a[0]}" stop-opacity="0"/></radialGradient><radialGradient id="o2"><stop stop-color="${a[1]}" stop-opacity=".22"/><stop offset="1" stop-color="${a[1]}" stop-opacity="0"/></radialGradient>
 <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0E2240"/><stop offset="1" stop-color="#070F1C"/></linearGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#FFFFFF" stroke-opacity=".035" stroke-width="2"/></pattern>
 <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".45"/></filter>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`+
 R(0,0,W,H,'url(#bg)',0)+`<rect width="${W}" height="${H}" fill="url(#grid)" transform="translate(0,${-(t*18)%60})"/>`+`<circle cx="${x1}" cy="${y1}" r="620" fill="url(#o1)"/><circle cx="${x2}" cy="${y2}" r="680" fill="url(#o2)"/>`;}

function header(r,index,count,t,total){const p=clamp(t/total);
 return `<image href="${r.logo}" x="64" y="118" width="300" height="85"/>`+R(64,236,952,6,'#FFFFFF1F',3)+R(64,236,952*p,6,ORANGE,3)+
  T(String(index+1).padStart(2,'0')+'/'+String(count).padStart(2,'0'),900,196,26,MUTED,700);}

// Ventana tipo navegador con la captura auténtica; la cámara se mueve dentro sin alterar la interfaz.
// Ventana tipo navegador con la captura auténtica. La cámara parte de la captura completa y se acerca hasta que el dato llena el visor.
function viewer(c,w,maxIh,focus){const f=focus||[0,0,c.width,c.height],s0=Math.min(w/c.width,maxIh/c.height),s1=Math.max(s0,Math.min(w*.88/f[2],maxIh*.86/f[3],s0*3.4));return {f,s0,s1,ih:Math.round(Math.min(maxIh,Math.max(c.height*s0,f[3]*s1/.86)))};}
function device(c,x,y,w,maxH,{focus=null,t=0,dur=1,highlight=true,enter=1,zoom=true}){const bar=54,{f,s0,s1,ih}=viewer(c,w,maxH-bar,focus),h=ih+bar;
 const k=zoom?easeInOut((t-.35)/(dur*.62)):0,scale=s0+(s1-s0)*k;
 const fx=f[0]+f[2]/2,fy=f[1]+f[3]/2,cx=c.width/2+(fx-c.width/2)*k,cy=c.height/2+(fy-c.height/2)*k;
 let ox=w/2-cx*scale,oy=ih/2-cy*scale;const iw=c.width*scale,iH=c.height*scale;
 ox=iw<=w?(w-iw)/2:Math.min(0,Math.max(w-iw,ox));oy=iH<=ih?(ih-iH)/2:Math.min(0,Math.max(ih-iH,oy));
 const id='clip'+Math.round(x+y);
 let s=`<g transform="translate(0,${(1-enter)*90}) " opacity="${enter}"><g filter="url(#sh)">`+R(x,y,w,h,'#FFFFFF',28)+`</g>`+R(x,y,w,bar,'#EEF2F6',28)+R(x,y+bar-28,w,28,'#EEF2F6',0)+
  `<circle cx="${x+34}" cy="${y+27}" r="9" fill="#FF5F57"/><circle cx="${x+62}" cy="${y+27}" r="9" fill="#FEBC2E"/><circle cx="${x+90}" cy="${y+27}" r="9" fill="#28C840"/>`+R(x+128,y+13,w-160,28,'#FFFFFF',14)+T('app.comandpos.com',x+150,y+34,19,'#6B7C8F',600)+
  `<defs><clipPath id="${id}"><rect x="${x}" y="${y+bar}" width="${w}" height="${ih}"/></clipPath></defs><g clip-path="url(#${id})">`+R(x,y+bar,w,ih,'#FFFFFF',0)+
  `<svg x="${x+ox}" y="${y+bar+oy}" width="${iw}" height="${iH}" viewBox="${c.crop.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${c.data}" width="${c.fullWidth}" height="${c.fullHeight}"/></svg>`;
 if(focus&&highlight){const hx=x+ox+f[0]*scale,hy=y+bar+oy+f[1]*scale,hw=f[2]*scale,hh=f[3]*scale,a=clamp((k-.55)/.3);s+=`<rect x="${hx-6}" y="${hy-6}" width="${hw+12}" height="${hh+12}" rx="16" fill="none" stroke="${ORANGE}" stroke-width="7" opacity="${a*(.75+.25*Math.sin(t*6))}" filter="url(#glow)"/>`;}
 return {svg:s+`</g>`+R(x,y,w,h,'none',28,`stroke="#FFFFFF33" stroke-width="2"`)+'</g>',h};}

function kicker(s,x,y,t){const p=easeOut(t/.5),w=widthOf(s.toUpperCase(),28,800)+56;return `<g opacity="${p}" transform="translate(${(1-p)*-40},0)">`+R(x,y-44,w,62,ORANGE+'26',31)+R(x,y-44,8,62,ORANGE,4)+T(s.toUpperCase(),x+30,y-3,28,ORANGE,800,'letter-spacing="1.5"')+'</g>';}
function headline(s,x,y,size,max,t,delay=0,fill=WHITE){const ls=wrap(s,size,max,900);return ls.map((l,i)=>{const p=easeOut((t-delay-i*.12)/.55);return `<g opacity="${p}" transform="translate(0,${(1-p)*40})">`+T(l,x,y+i*size*1.08,size,fill,900,'letter-spacing="-1"')+'</g>';}).join('');}

// Subtítulos cinéticos: grupos cortos por frase, palabra activa resaltada. Nunca se corta una palabra ni se deja un grupo huérfano.
function captionGroups(words){const groups=[];let cur=[];for(const w of words){cur.push(w);const end=/[.,;:!?]$/.test(w.word),long=cur.map(x=>x.word).join(' ').length>=16||cur.length>=3;if(end||long){groups.push(cur);cur=[];}}if(cur.length){if(groups.length&&cur.length===1&&groups.at(-1).length<4)groups.at(-1).push(...cur);else groups.push(cur);}return groups;}
function captions(j,index,t){const s=j.plan.scenes[index],v=j.voices[index];return window.studioCaption(v.words,t-s.voice_lead,window.currentStoryboard||{},W,H,1478,66)}

function sceneBody(j,r,index,t){const s=j.plan.scenes[index],e=j.evidence,d=s.duration,n=j.plan.scenes.length,variant=j.design_variant||0;
 const enter=easeOut(t/.45);
 if(s.rol==='gancho'){// Gancho: la frase que detiene el scroll, grande y en dos tiempos.
  let v=kicker('Caso ilustrativo',72,400,t)+headline(s.titulo,72,540,96,930,t,.1);
  const ly=540+wrap(s.titulo,96,930,900).length*104+40;
  const sc=device(r.crops[0],72,ly+40,936,Math.min(560,1300-ly-40),{focus:e.focus,t,dur:d*1.6,highlight:false,enter:easeOut((t-.5)/.5)});
  return v+sc.svg;}
 if(s.rol==='cierre'){// Cierre: marca, oferta y un único llamado.
  const p=back(t/.5),pulse=1+.035*Math.sin(t*5.5);
  let v=`<g opacity="${clamp(t/.3)}" transform="translate(${W/2},560) scale(${.8+.2*p}) translate(${-W/2},-560)"><image href="${r.logo}" x="${(W-620)/2}" y="440" width="620" height="176"/></g>`;
  v+=headline(s.titulo||'Solicita tu demo',W/2,800,92,900,t,.2,WHITE).replace(/x="540"/g,'x="540" text-anchor="middle"');
  v+=`<g opacity="${easeOut((t-.5)/.4)}">`+T(e.label+', en un solo sistema.',W/2,1045,34,MUTED,600,'text-anchor="middle"')+'</g>';
  const bp=easeOut((t-.7)/.4);v+=`<g opacity="${bp}" transform="translate(${W/2},1170) scale(${pulse*(0.9+.1*bp)}) translate(${-W/2},-1170)"><g filter="url(#sh)">`+R(140,1100,800,140,'#25D366',70)+`</g>`+
   `<path transform="translate(200,1128) scale(3.6)" fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/>`+
   T('+1 849 540 6093',588,1193,58,WHITE,900,'text-anchor="middle"')+'</g>';
  v+=`<g opacity="${easeOut((t-1)/.4)}">`+T('Escríbenos por WhatsApp · comandpos.com',W/2,1300,30,WHITE,700,'text-anchor="middle" opacity=".9"')+'</g>';
  return v;}
 // Escenas de producto: título, captura grande con cámara hacia el dato y etiqueta del dato.
 const detail=s.rol==='detalle'&&r.crops[1],c=detail?r.crops[1]:r.crops[0];
 let v=kicker(detail?'El dato que importa':'Así se ve en ComandPOS',72,400,t)+headline(s.title,72,530,78,930,t,.08);
 const ly=530+wrap(s.title,78,930,900).length*84+30;
 const inDetail=e.focus&&[e.focus[0]+e.crop[0]-e.detail[0],e.focus[1]+e.crop[1]-e.detail[1],e.focus[2],e.focus[3]],fits=inDetail&&inDetail[0]>=0&&inDetail[1]>=0&&inDetail[0]+inDetail[2]<=e.detail[2]&&inDetail[1]+inDetail[3]<=e.detail[3];
 const box=detail?(fits?inDetail:null):e.focus,room=1330-ly,probeH=device(c,0,0,936,Math.min(640,room),{focus:box,t:0,dur:d}).h,top=ly+Math.max(0,(room-probeH-60)/2);
 const sc=device(c,72,top,936,Math.min(640,room),{focus:box,t,dur:d,highlight:!!box,enter});v+=sc.svg;const dh=sc.h;
 const lp=back((t-.9)/.4),label=e.labels[detail?1:0],lw=widthOf(label,36,800)+110,ly2=top;
 v+=`<g opacity="${clamp((t-.9)/.25)}" transform="translate(${W/2},${ly2+dh+10}) scale(${.7+.3*lp}) translate(${-W/2},${-(ly2+dh+10)})"><g filter="url(#sh)">`+R((W-lw)/2,ly2+dh-30,lw,80,ORANGE,40)+`</g>`+`<circle cx="${(W-lw)/2+42}" cy="${ly2+dh+10}" r="11" fill="#fff"/>`+T(label,(W-lw)/2+68,ly2+dh+23,36,'#0B1A2E',800)+'</g>';
 const note=detail?e.steps[2]:e.benefit;if(note){const np=easeOut((t-1.4)/.5),ny=ly2+dh+150;v+=`<g opacity="${np}" transform="translate(0,${(1-np)*30})">`+R(72,ny-58,8,76,ORANGE,4)+wrap(note,48,880,800).map((l,k)=>T(l,104,ny+k*58,48,WHITE,800)).join('')+'</g>';}
 return v;}

function frame(j,r,index,t){const s=j.plan.scenes[index],n=j.plan.scenes.length,total=j.plan.scenes.reduce((a,b)=>a+b.duration,0),elapsed=j.plan.scenes.slice(0,index).reduce((a,b)=>a+b.duration,0)+t;
 // Transición: la escena entra con un leve empuje y sale acelerando hacia arriba.
 const out=clamp((t-(s.duration-.22))/.22),inn=index===0?1:easeOut(t/.28),dy=(1-inn)*60-out*90,op=Math.min(inn*1.2,1-out*.9);
 let v=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`+background(elapsed,j.design_variant||0)+header(r,index,n,elapsed,total);
 v+=`<g transform="translate(0,${dy})" opacity="${op}">`+sceneBody(j,r,index,index===0?Math.max(1,t):t)+'</g>';
 v+=captions(j,index,t);
 v+=T((index===0?'Caso ilustrativo · producto real':index===n-1?'ComandPOS by GCODE':'Captura real · datos de ejemplo')+' · Locución generada con IA',72,1580,21,MUTED,600,'opacity=".85"');
 return v+'</svg>';}


window.renderN8n=function(story,scenes,index,t){
 const e=story.evidencia;
 const j={plan:{hook:scenes[0].titulo,scenes:scenes.map(s=>({...s,title:s.titulo,duration:s.dur,voice_lead:s.voz_inicio??s.audio_local?.inicio??.3}))},evidence:e,design_variant:2,voices:scenes.map(s=>({tempo:1,words:s.palabras||[]}))};
 const r={logo:'assets/n8n-logo.png',crops:[e.crop,e.detail].map(crop=>({data:e.imagen,crop,width:crop[2],height:crop[3],fullWidth:e.ancho,fullHeight:e.alto}))};
 return frame(j,r,index,t);
};
window.subtitulosCineticos=function(s,t,y=1510){
 if(!s.palabras?.length)return '';
 const j={plan:{scenes:[{voice_lead:s.voz_inicio??.35}]},voices:[{tempo:1,words:s.palabras}]};
 return `<g transform="translate(0,${y-1478})">${captions(j,0,t)}</g>`;
};
})();
