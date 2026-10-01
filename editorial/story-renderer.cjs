'use strict';
async function renderStory(c,sharp,fs,assets,logoPath) {
 if(!c.validated)throw Error('Unvalidated story');
 const W=1080,H=1920,navy='#16213e',orange='#FF6B35',paper='#F6F3ED',mint='#D7F0E7';
 const light=['checklist','spotlight','walkthrough'].includes(c.layout);
 const bg=light?paper:navy,ink=light?navy:'#FFFFFF',muted=light?'#4B596A':'#C5CFDC';
 const overlays=[],metrics=[];
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="1080" height="1920" fill="${bg}"/>`;
 const rect=(x,y,w,h,color,r=24)=>{svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`;};
 const line=(x,y,w,color)=>rect(x,y,w,4,color,2);
 async function text(s,x,y,w,h,size,color=ink,bold=false,label='text'){
  let buf,info,used=size;
  for(;used>=22;used-=2){
   const result=await sharp({text:{text:`<span foreground="${color}">${esc(s)}</span>`,font:`Montserrat${bold?' Bold':''} ${used}`,width:w,rgba:true,spacing:8,wrap:'word'}}).png().toBuffer({resolveWithObject:true});
   if(result.info.height<=h&&result.info.width<=w){buf=result.data;info=result.info;break;}
  }
  if(!buf||used<Math.min(size,30))throw Error('Text does not fit: '+label+' '+s);
  overlays.push({input:buf,left:x,top:y,width:info.width,height:info.height});metrics.push({label,text:s,x,y,width:info.width,height:info.height,font:used});
 }
 async function capture(x,y,w,h,partial=false){
  const allowed=['cocina','mesas','cuenta','cuentaxcobrar','comtabilidad','reporteBI','recursohumanos_empleados','nomina'];
  if(!allowed.includes(c.asset))throw Error('Unapproved product asset');
  let img=sharp(fs.readFileSync(assets+'/'+c.asset+'.webp'));
  if(partial){const m=await img.metadata();img=img.extract({left:0,top:0,width:Math.round(m.width*.68),height:Math.round(m.height*.7)});}
  const data=await img.resize(w,h,{fit:'contain',background:'#FFFFFF'}).png().toBuffer();
  overlays.push({input:data,left:x,top:y,width:w,height:h});
 }
 rect(72,218,10,50,orange,5);
 rect(95,205,465,90,navy,12);
 const logo=await sharp(fs.readFileSync(logoPath)).trim().resize(430,80,{fit:'contain',background:navy}).png().toBuffer();
 overlays.push({input:logo,left:110,top:210,width:430,height:80});
 await text(c.horario===13?'EN TU RESTAURANTE':'POR DENTRO',72,310,900,40,25,light?'#9F3C14':'#FFAB83',true,'section');
 if(c.layout==='question'){
  rect(820,225,190,105,orange,50);await text('¿Y TÚ?',848,253,148,45,28,navy,true,'badge');
  await text(c.titulo,72,415,925,285,84,ink,true,'headline');
  line(72,754,104,orange);
  await text(c.cuerpo,72,800,920,180,43,ink,false,'lesson');
  for(let i=0;i<c.points.length;i++){rect(72,1040+i*116,936,96,'#223250',16);await text(c.points[i],103,1068+i*116,858,58,32,ink,false,'point');}
 }else if(c.layout==='checklist'){
  await text(c.titulo,72,400,920,230,76,ink,true,'headline');
  await text(c.cuerpo,72,675,920,152,37,muted,false,'lesson');
  for(let i=0;i<c.points.length;i++){const y=885+i*165;rect(72,y,936,142,'#FFFFFF',22);rect(96,y+30,76,76,i===1?mint:orange,18);await text(String(i+1).padStart(2,'0'),113,y+51,60,50,33,navy,true,'number');await text(c.points[i],204,y+40,748,80,36,navy,true,'point');}
 }else if(c.layout==='steps'){
  rect(0,372,1080,335,orange,0);await text(c.titulo,72,419,922,245,76,navy,true,'headline');
  await text(c.cuerpo,72,770,924,178,39,ink,false,'lesson');
  for(let i=0;i<c.points.length;i++){const y=1010+i*125;line(72,y+80,935,'#40516A');await text(['01','02','03'][i],72,y,98,68,48,'#FFAB83',true,'number');await text(c.points[i],196,y+4,803,78,37,ink,false,'point');}
 }else if(c.layout==='spotlight'){
  await text(c.titulo,72,405,930,237,76,ink,true,'headline');
  await text(c.cuerpo,72,680,925,180,38,muted,false,'lesson');
  rect(72,916,936,474,'#FFFFFF',24);await capture(96,963,888,350);
  await text('CAPTURA REAL · DATOS DEMOSTRATIVOS',100,1347,872,35,23,muted,true,'disclosure');
 }else if(c.layout==='detail'){
  await text(c.titulo,72,400,930,233,73,ink,true,'headline');
  rect(72,716,936,498,'#FFFFFF',24);await capture(96,752,888,365,true);
  await text('VISTA PARCIAL · DATOS DEMOSTRATIVOS',100,1156,870,40,23,navy,true,'disclosure');
  line(72,1272,100,orange);await text(c.cuerpo,72,1310,931,152,35,ink,false,'lesson');
 }else if(c.layout==='walkthrough'){
  rect(740,0,340,1920,mint,0);await text(c.titulo,72,403,922,244,74,navy,true,'headline');
  rect(72,704,936,440,'#FFFFFF',22);await capture(96,741,888,318);
  await text('CAPTURA REAL · DATOS DEMOSTRATIVOS',100,1087,868,38,23,navy,true,'disclosure');
  rect(72,1205,936,228,navy,24);await text(c.cuerpo,104,1244,868,154,35,'#FFFFFF',false,'lesson');
 }else throw Error('Unsupported layout');
 // All meaningful copy stays above y=1675, clear of the bottom story controls.
 line(72,1490,936,light?'#D8D6CF':'#40516A');
 await text(c.cta,72,1530,780,78,32,ink,true,'cta');
 await text(c.commercial?'WhatsApp  +1 849 540 6093':'Una idea para tu próximo turno',72,1630,785,45,26,muted,false,'contact');
 // Embed layers in the SVG to avoid passing vm2-proxied arrays to libvips.
 for(const o of overlays)svg+=`<image x="${o.left}" y="${o.top}" width="${o.width}" height="${o.height}" href="data:image/png;base64,${o.input.toString('base64')}"/>`;
 svg+='</svg>';
 const buffer=await sharp(Buffer.from(svg)).jpeg({quality:93,mozjpeg:true}).toBuffer();
 if(buffer.length>4*1024*1024)throw Error('Story exceeds Facebook file limit');
 return {buffer,metrics};
}
module.exports={renderStory};
