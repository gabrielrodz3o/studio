import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('./deploy/studio-media-proxy.cjs',import.meta.url),'utf8');
function request(url,{status=200,type='application/octet-stream',method='GET'}={}){
 let handler,target,response;
 const http={createServer(fn){handler=fn;return {on(){},listen(){}}},request(options,callback){target=options.hostname;callback({statusCode:status,headers:{'content-type':type},pipe(){},on(event,fn){if(event==='data')fn(Buffer.from('video'));if(event==='end')fn()}});return {on(){},destroy(){}}}};
 vm.runInNewContext(source,{require:()=>http,URL,process:{env:{}}});
 handler({url,method,headers:{},on(){},pipe(){}},{writeHead(code,headers){response={code,...headers}},on(){},end(){},destroy(){}});
 return {target,response};
}
const stem='/webhook/cdn?f=studio-1c9e1ac1-302a-4efd-a61f-8057ad59a9a4-0';
test('Studio exports use existing n8n media service with correct MIME',()=>{
 for(const [ext,mime] of [['jpg','image/jpeg'],['mp4','video/mp4']]){
  const r=request(stem+'.'+ext);assert.equal(r.target,'n8n');assert.equal(r.response['content-type'],mime);
 }
 const head=request(stem+'.mp4',{status:206,method:'HEAD'});assert.equal(head.response['content-type'],'video/mp4');assert.equal(head.response['content-length'],'5');
});
test('media routing preserves unrelated services and rejects malformed names',()=>{
 for(const path of ['/webhook/cdn?f=legacy.jpg','/webhook/cdn?f=studio-../../secret.jpg','/media/gr_324a70ef6e7d6b80b940938c.mp4','/trendlore/tiktok/status'])assert.equal(request(path).target,'trendlore-worker');
 assert.equal(request('/rest/settings').target,'n8n');
});
test('upstream failures retain error status and content type',()=>{
 const r=request(stem+'.mp4',{status:503,type:'application/json'});assert.equal(r.response.code,503);assert.equal(r.response['content-type'],'application/json');
});
