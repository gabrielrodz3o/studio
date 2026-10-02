import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {editorialVideo,editorialVideoStyle} from './editorial-video.mjs';
import {validar} from './validar.mjs';

test('editorial rotation follows latest video of this brand, ignoring feed and other brands',()=>{
 const h=[{brand_id:'comandpos',kind:'video',style:'comercial',at:'2026-10-01'}, {brand_id:'comandpos',kind:'imagen',style:'historia',at:'2026-10-03'}, {brand_id:'other',kind:'video',style:'tutorial',at:'2026-10-04'}];
 assert.equal(editorialVideoStyle(h),'historia');
 h.push({brand_id:'comandpos',kind:'video',style:'historia',at:'2026-10-02'});
 assert.equal(editorialVideoStyle(h),'tutorial');
 h.push({brand_id:'comandpos',kind:'video',style:'tutorial',at:'2026-10-05'});
 assert.equal(editorialVideoStyle(h),'comercial');
});

test('three editorial families preserve source crops and produce different scene structures',async t=>{
 const root=await mkdtemp(join(tmpdir(),'studio-editorial-styles-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'feed'));await cp(new URL('./feed/brand',import.meta.url),join(root,'feed/brand'),{recursive:true});
 const structures=[];
 for(const style of ['comercial','historia','tutorial']){
  const script=await editorialVideo({asset:'cocina',title:'Mesa 7: sin cebolla',cta:'Pide tu demo'},root,{style});
  validar(script);assert.equal(script.formato,style);assert.ok(script.evidencia.source_sha256);
  structures.push(script.escenas.map(x=>x.tipo).join('|'));
  for(const s of script.escenas.filter(x=>x.tipo==='producto_paso')){
   assert.equal(s.imagen,script.evidencia.imagen);assert.ok([script.evidencia.crop,script.evidencia.detail].some(c=>JSON.stringify(c)===JSON.stringify(s.recorte)));
   assert.throws(()=>validar({...script,escenas:[{...s,step:0}]}),/Paso/);
   assert.throws(()=>validar({...script,escenas:[{...s,recorte:[0,0,999999,50]}]}),/recorte/);
  }
 }
 assert.equal(new Set(structures).size,3);
 await assert.rejects(editorialVideo({asset:'cocina'},root,{style:'inventado'}),/sin composición/);
});
