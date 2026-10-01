'use strict';
async function renderFeed(c,slide,sharp,fs,assets){
 if(c.story){
  const inner=await renderFeed({...c,story:false},slide,sharp,fs,assets);
  const top=220;
  const buffer=await sharp({create:{width:1080,height:1920,channels:3,background:'#14233B'}}).composite([{input:inner.buffer,left:0,top}]).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toBuffer();
  return {buffer,validation:{...inner.validation,dimensions:'1080x1920',safe_area:{top:220,bottom:350},metrics:inner.validation.metrics.map(m=>({...m,y:m.y+top}))}};
 }
 const W=1080,H=c.story?1920:1350,N='#14233B',O='#FF6B35',WHITE='#FFFFFF',layers=[],metrics=[];
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const svg=s=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`);
 const shape=s=>layers.push({input:svg(s),left:0,top:0});
 const rect=(x,y,w,h,fill,r=0)=>shape(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`);
 async function text(s,x,y,w,h,size,color=WHITE,bold=true,label='text',min=30){
  if(!s)throw Error('Texto vacío '+label);
  let found;const content=label==='headline'?esc(s).replace(/\S+$/,word=>`<span foreground="${O}">${word}</span>`):esc(s);
  for(let f=size;f>=min;f-=2){const r=await sharp({text:{text:`<span foreground="${color}">${content}</span>`,font:`Montserrat${bold?' Black':''} ${f}`,fontfile:assets+(bold?'/Montserrat-Black.ttf':'/Montserrat.ttf'),width:w,rgba:true,spacing:4,wrap:'word'}}).png().toBuffer({resolveWithObject:true});if(r.info.height<=h&&r.info.width<=w){found=r;metrics.push({label,text:s,x,y,width:r.info.width,height:r.info.height,font:f});break;}}
  if(!found)throw Error('Texto desborda: '+label);layers.push({input:found.data,left:x,top:y});
 }
 async function photo(x,y,w,h,r=0){
  if(!c.photo_file||!fs.existsSync(c.photo_file))throw Error('Falta fotografía contextual');
  let image=await sharp(fs.readFileSync(c.photo_file)).rotate().resize(w,h,{fit:'cover',position:inside?'north':'centre'}).png().toBuffer();
  if(r)image=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><clipPath id="c"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs><image width="${w}" height="${h}" clip-path="url(#c)" href="data:image/png;base64,${image.toString('base64')}"/></svg>`)).png().toBuffer();
  layers.push({input:image,left:x,top:y});
 }
 async function capture(x,y,w,h){
  const key=String(c.product_asset||'').split('/').pop().replace('.webp','');
  if(!['cocina','mesas','cuenta','cuentaxcobrar','comtabilidad','reporteBI','recursohumanos_empleados','nomina'].includes(key))throw Error('Captura no aprobada');
  let img=sharp(fs.readFileSync(assets+'/'+key+'.webp')),m=await img.metadata();
  if(key==='cocina'&&m.width>=1500&&m.height>=800)img=img.extract({left:820,top:58,width:440,height:430});
  else if(key==='cuenta')img=img.extract({left:0,top:0,width:Math.round(m.width*.53),height:m.height});
  else if(key==='mesas')img=img.extract({left:0,top:0,width:Math.round(m.width*.65),height:Math.round(m.height*.72)});
  rect(x-12,y-12,w+24,h+24,WHITE,24);
  layers.push({input:await img.resize(w,h,{fit:'contain',background:WHITE}).png().toBuffer(),left:x,top:y});
 }
 const idx=slide?.slideIndex||1,inside=slide&&idx>1&&idx<(slide.slideCount||4),end=slide&&idx===(slide.slideCount||4);
 const headline=end?c.ctaVisual:inside?slide.slideText:c.texto_en_imagen;
 const layout=c.design.layout;
 if(inside){
  await photo(0,0,W,440);shape('<rect width="1080" height="440" fill="#14233B" opacity="0.28"/>');
  rect(64,380,130,120,O,18);await text(String(idx-1).padStart(2,'0'),88,408,100,70,56,N,true,'number');
  await text(headline,64,540,952,190,66,WHITE,true,'headline',42);
  if(c.design.commercial&&c.product_asset){await capture(76,780,928,345);await text(slide.slideBody,64,1152,952,48,30,WHITE,false,'body',26);}
  else {await text(slide.slideBody,64,780,952,330,48,WHITE,false,'body',32);rect(64,1140,100,7,O,3);}
 }else if(layout==='photo-first'&&!end){
  await photo(0,0,W,c.story?1100:750);shape('<defs><linearGradient id="shade" x2="0" y2="1"><stop stop-color="#14233B" stop-opacity=".70"/><stop offset=".45" stop-color="#14233B" stop-opacity="0"/></linearGradient></defs><rect width="1080" height="750" fill="url(#shade)"/>');
  rect(0,c.story?1084:734,W,650,N);rect(64,c.story?1134:784,86,8,O,4);
  await text(headline,64,c.story?1175:825,952,255,86,WHITE,true,'headline',48);
  await text(c.design.subline,64,c.story?1465:1115,952,94,32,'#D9E2EC',false,'subline',28);
 }else if(layout==='product-scene'&&c.product_asset&&!end){
  await text(headline,64,186,952,244,84,WHITE,true,'headline',48);
  await photo(0,462,W,c.story?1100:676);await capture(525,c.story?1100:716,475,421);
  rect(64,c.story?1670:1154,375,46,O,12);await text('CAPTURA REAL DEL SISTEMA',82,c.story?1680:1164,350,28,20,N,true,'capture-label',20);
 }else{
  await text(headline,64,188,952,248,86,WHITE,true,'headline',48);
  rect(64,455,88,8,O,4);
  await photo(38,509,1004,c.story?1180:667,28);
  if(end){rect(64,974,952,190,N,20);await text(c.endBody||(c.design.commercial?'Conoce cómo se adapta a tu restaurante.':c.tipo_contenido==='entretenimiento'?'Cuéntanos cómo lo resuelven en tu restaurante.':'Vuelve a estos pasos antes de tu próximo turno.'),96,1006,888,128,42,WHITE,false,'end-body',30);}
  else {rect(64,c.story?1570:1090,952,105,N,18);await text(c.design.subline,88,c.story?1594:1114,904,67,30,WHITE,false,'subline',26);}
 }
 const logo=await sharp(fs.readFileSync(assets+'/logo.png')).trim().resize(390,105,{fit:'inside'}).png().toBuffer();layers.push({input:logo,left:64,top:52});
 await text('ESCENA ILUSTRATIVA',64,H-140,660,24,17,'#B7C5D5',false,'illustration',17);
 rect(64,H-110,952,2,'#3B4B60');
 await text(slide&&idx<4?'DESLIZA PARA CONTINUAR →':c.ctaVisual,64,H-78,660,40,25,WHITE,true,'cta',21);
 await text('comandpos.com',772,H-75,244,36,23,'#B7C5D5',false,'website',21);
 for(const m of metrics)if(m.x<38||m.y<38||m.x+m.width>1042||m.y+m.height>H-30)throw Error('Margen inseguro '+m.label);
 let markup=`<rect width="${W}" height="${H}" fill="${N}"/>`;
 for(const l of layers){const m=await sharp(l.input).metadata();markup+=`<image x="${l.left}" y="${l.top}" width="${m.width}" height="${m.height}" href="data:image/${m.format==='svg'?'svg+xml':'png'};base64,${l.input.toString('base64')}"/>`;}
 const buffer=await sharp(svg(markup)).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toBuffer();
 return {buffer,validation:{passed:true,version:16,layout,dimensions:`1080x${H}`,photo_required:true,official_logo:true,metrics}};
}
module.exports={renderFeed};
