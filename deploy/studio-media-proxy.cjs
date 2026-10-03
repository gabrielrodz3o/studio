'use strict';
// Transparent HTTP/WebSocket proxy. Media requests bypass the n8n process.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
function createMediaProxy({backend=process.env.N8N_UPSTREAM||'http://n8n:5678',worker=process.env.MEDIA_UPSTREAM||'http://trendlore-worker:8090',cdnRoot=process.env.STUDIO_CDN_ROOT||'/studio-cdn'}={}){
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://proxy');
 const media=(u.pathname==='/webhook/cdn'||/^\/media\/gr_[a-f0-9]{24}(?:-facebook-v[0-9]+)?\.(?:mp4|jpg)$/.test(u.pathname))&&['GET','HEAD'].includes(req.method);
 const tiktok=u.pathname.startsWith('/trendlore/tiktok/');
 // Studio keeps its approved exports in n8n's existing CDN mount.
  const studioMedia=media && u.pathname==='/webhook/cdn' && /^studio-[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}-[0-7]\.(?:jpg|mp4)$/.test(u.searchParams.get('f')||'');
  if(studioMedia){
   // Read only exact export basenames from a read-only mount. Never call n8n.
   let file;
   try{
    const name=u.searchParams.get('f');file=await fs.promises.open(path.join(cdnRoot,name),fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
    const stat=await file.stat();if(!stat.isFile())throw Error('Not a file');
    let start=0,end=stat.size-1,code=200;
    const headers={'content-type':name.endsWith('.mp4')?'video/mp4':'image/jpeg','accept-ranges':'bytes','cache-control':'public, max-age=86400','x-content-type-options':'nosniff'};
    if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);let valid=!!match&&!!(match[1]||match[2]);if(valid){if(match[1]){start=Number(match[1]);end=match[2]?Number(match[2]):end}else{start=Math.max(0,stat.size-Number(match[2]))}end=Math.min(end,stat.size-1);valid=Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<=end&&start<stat.size}if(!valid){res.writeHead(416,{'content-range':'bytes */'+stat.size});res.end();return}code=206;headers['content-range']=`bytes ${start}-${end}/${stat.size}`;}
    headers['content-length']=String(Math.max(0,end-start+1));res.writeHead(code,headers);
    if(req.method==='HEAD'||stat.size===0){res.end();return}
    const stream=file.createReadStream({start,end,autoClose:true});file=null;
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
   }catch(e){if(!res.headersSent){res.writeHead(['ENOENT','ELOOP','ENOTDIR'].includes(e.code)?404:503,{'content-type':'text/plain','cache-control':'no-store'});res.end('Media unavailable')}else res.destroy();}
   finally{await file?.close()}
   return;
  }
  const target=new URL(media||tiktok?worker:backend);
 const upstream=http.request({hostname:target.hostname,port:target.port,method:studioMedia&&req.method==='HEAD'?'GET':req.method,path:req.url,headers:req.headers},r=>{const headers={...r.headers};if(studioMedia&&[200,206].includes(r.statusCode))headers['content-type']=u.searchParams.get('f').endsWith('.mp4')?'video/mp4':'image/jpeg';if(studioMedia&&req.method==='HEAD'){let bytes=0;r.on('data',chunk=>{bytes+=chunk.length});r.on('end',()=>{delete headers['transfer-encoding'];headers['content-length']=String(bytes);res.writeHead(r.statusCode,headers);res.end()});r.on('error',()=>res.destroy());}else{res.writeHead(r.statusCode,headers);r.pipe(res);}});
 upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain'});res.end('Upstream unavailable');});
 req.on('aborted',()=>upstream.destroy());res.on('close',()=>upstream.destroy());req.pipe(upstream);
});
server.on('upgrade',(req,socket,head)=>{
 const target=new URL(backend);const upstream=http.request({hostname:target.hostname,port:target.port,path:req.url,headers:req.headers});
 upstream.on('upgrade',(r,peer,upHead)=>{socket.write(`HTTP/1.1 ${r.statusCode} ${r.statusMessage}\r\n`+Object.entries(r.headers).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');if(upHead.length)socket.write(upHead);if(head.length)peer.write(head);peer.pipe(socket);socket.pipe(peer);peer.on('error',()=>socket.destroy());socket.on('error',()=>peer.destroy());});
 upstream.on('response',r=>{socket.end(`HTTP/1.1 ${r.statusCode} ${r.statusMessage}\r\nConnection: close\r\n\r\n`);r.resume();});upstream.on('error',()=>socket.destroy());upstream.end();
});
return server;
}
if(require.main===module)createMediaProxy().listen(Number(process.env.PORT||5678),'0.0.0.0');
module.exports={createMediaProxy};
