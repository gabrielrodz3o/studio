import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {publicationBundle,hash} from './releases.mjs';
test('primer cuadro comercial tiene título y captura visibles sin adelantar subtítulos',()=>{
 const story=JSON.parse(readFileSync(new URL('./storyboards/comercial-n8n.json',import.meta.url)));let captionTime;
 const window={studioCaption:(words,t)=>{captionTime=t;return ''}};
 vm.runInNewContext(readFileSync(new URL('./n8n-style.js',import.meta.url),'utf8'),{window,document:{createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*38})})})}});
 const svg=window.renderN8n(story,story.escenas,0,0);
 assert.match(svg,/<image/);assert.ok(!/<g[^>]*\sopacity="0"/.test(svg));assert.ok(captionTime<=0);
});
test('cambiar portada invalida aprobación sin cambiar hashes de exportaciones anteriores',()=>{
 const piece={id:'p',caption:'Texto',channel:'tiktok',kind:'video'},job={id:'j',kind:'video',artifact:{sha256:'a'.repeat(64)}};
 const old=publicationBundle(piece,job,{},{});assert.ok(!('cover_time' in old));
 job.artifact.cover_time=1;const a=publicationBundle(piece,job,{},{});job.artifact.cover_time=2;assert.notEqual(hash(a),hash(publicationBundle(piece,job,{},{})));
});
