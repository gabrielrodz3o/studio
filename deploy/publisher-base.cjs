'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const SOURCE_WORKFLOW = 'h40YN1b3Yq8G1wyK';
const CHANNELS = {
  facebook: {id:'6aaf1987ea19ca0bde8f6f1a', name:'G code', externalLink:'https://facebook.com/1901371183485176'},
  tiktok: {id:'6aaf19f9ea19ca0bde8f79cd', name:'g.code.rd', externalLink:'https://tiktok.com/@g.code.rd'},
};
const FIELDS = 'id channelId channelService status schedulingType externalLink sentAt metadata { ... on TiktokPostMetadata { isAiGenerated } ... on FacebookPostMetadata { type } }';
function assert(ok, message) { if (!ok) throw new Error(message); }
function write(file, data) {
  fs.mkdirSync(path.dirname(file), {recursive:true, mode:0o700});
  const tmp = file + '.' + crypto.randomUUID() + '.tmp';
  const fd = fs.openSync(tmp, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(data, null, 2)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(tmp, file);
}
function read(file) { try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch(e) { if(e.code==='ENOENT') return null; throw e; } }
function validMedia(url) {
  const u = new URL(url);
  assert(u.protocol==='https:' && !u.username && !u.password && !u.port, 'Invalid media URL');
  assert(['n8n.gcoderd.com','tempfile.aiquickdraw.com'].includes(u.hostname), 'Unapproved media host');
  return u.href;
}
function sourceFromExecution(row, execution) {
  assert(row.is_published && /^\d+$/.test(row.instagram_media_id||''), 'Source is not published');
  assert(execution.workflowId===SOURCE_WORKFLOW && String(execution.id)===String(row.workflow_execution_id), 'Wrong source workflow/execution');
  const run = execution.data?.resultData?.runData || {};
  const json = name => run[name]?.at(-1)?.data?.main?.[0]?.[0]?.json;
  assert(String(json('Publicar en Instagram')?.id)===row.instagram_media_id, 'Source publication receipt mismatch');
  let kind='image', urls=[row.image_url];
  if(row.strategy_type==='reel') { kind='video'; urls=[json('Resultado Reel GCODE')?.videoUrl||json('Guardar URL Clip 1')?.videoUrl||row.image_url]; }
  else if(row.strategy_type==='carrusel') { kind='carousel'; urls=json('Crear Containers Carrusel IG')?.publicUrls; }
  assert(Array.isArray(urls) && urls.length>=1 && urls.length<=10, 'Missing source media');
  if(kind==='carousel') assert(urls.length>=2, 'Incomplete carousel');
  let hashtags=row.hashtags||json('Limpiar Contenido')?.hashtags||[];
  if(typeof hashtags==='string') hashtags=JSON.parse(hashtags);
  assert(Array.isArray(hashtags), 'Invalid hashtags');
  return {id:row.id, instagram_media_id:row.instagram_media_id, execution_id:row.workflow_execution_id,
    published_at:row.published_at, caption:row.caption, hashtags, title:row.strategy_theme||row.caption.split('\n')[0],
    kind, urls:urls.map(validMedia), isAiGenerated:kind==='video'};
}
function inputFor(source, network) {
  const channel=CHANNELS[network]; assert(channel, 'Unknown network');
  assert(source.caption?.trim() && source.urls?.length, 'Missing content');
  assert(['image','carousel','video','story'].includes(source.kind), 'Unknown source kind');
  if(source.kind==='story' && network==='tiktok') assert(source.tiktokMode==='feed', 'TikTok Stories unsupported; explicit feed choice required');
  assert(source.kind==='carousel' ? source.urls.length>=2 && source.urls.length<=10 : source.urls.length===1, 'Invalid media count');
  const tags=[...new Set([...(source.hashtags||[]),...(source.caption.match(/#[\p{L}\p{N}_]+/gu)||[])].map(t=>String(t).replace(/^#+/,'')).filter(t=>/^[\p{L}\p{N}_]+$/u.test(t)))].slice(0,network==='tiktok'?5:3);
  let caption=source.caption.replace(/#[\p{L}\p{N}_]+/gu,'').replace(/\*\*/g,'').replace(/\bInstagram\b/gi,network==='tiktok'?'TikTok':'Facebook').replace(/[ \t]+\n/g,'\n').trim();
  if(source.isAiGenerated && !/generad[oa].*IA/i.test(caption)) caption+='\n\nEscena ilustrativa generada con IA.';
  const text=source.kind==='story' && network==='facebook'?'':[caption,tags.map(t=>'#'+t).join(' ')].filter(Boolean).join('\n\n');
  assert(text.length<=2200, 'Caption exceeds conservative limit');
  const metadata=network==='facebook'?{facebook:{type:source.kind==='story'?'story':source.kind==='video'?'reel':'post'}}:
    {tiktok:source.kind==='video'?{isAiGenerated:source.isAiGenerated}:{title:source.title.slice(0,90)}};
  return {channelId:channel.id,text,schedulingType:'automatic',mode:'shareNow',needsApproval:false,saveToDraft:false,
    aiAssisted:true,metadata,assets:source.urls.map(url=>source.kind==='video'?{video:{url:validMedia(url)}}:{image:{url:validMedia(url)}}),source:'gcode-n8n'};
}
function checkChannel(c, network, organizationId) {
  const expected=CHANNELS[network];
  assert(c?.id===expected.id && c.service===network && c.name===expected.name && c.organizationId===organizationId && c.externalLink===expected.externalLink,'Channel identity mismatch');
  assert(!c.isDisconnected && !c.isLocked && !c.isQueuePaused,'Channel unavailable');
}
function publicationState(post, record) {
  assert(post?.id===record.post_id && post.channelId===CHANNELS[record.network].id && post.channelService===record.network,'Receipt identity mismatch');
  if(post.schedulingType!=='automatic') return 'needs_review';
  if(post.status!=='sent') return post.status;
  if(record.kind==='story' && record.network==='facebook' && post.metadata?.type!=='story') return 'needs_review';
  let u; try { u=new URL(post.externalLink); } catch { return 'sent_unverified'; }
  if(u.protocol!=='https:' || u.username || u.password) return 'sent_unverified';
  if(record.network==='tiktok') {
    if(!['www.tiktok.com','tiktok.com'].includes(u.hostname) || !/^\/@g\.code\.rd\/(?:video|photo)\/\d+\/?$/.test(u.pathname)) return 'sent_unverified';
    if(record.kind==='video' && post.metadata?.isAiGenerated!==true) return 'needs_review';
  } else if(!['www.facebook.com','facebook.com'].includes(u.hostname)) return 'sent_unverified';
  return 'published';
}
class Publisher {
  constructor({root,config,fetcher=fetch}) { Object.assign(this,{root,config,fetcher}); }
  file(id,network) { assert(/^\d+$/.test(String(id)) && CHANNELS[network],'Invalid record key'); return path.join(this.root,'records',`${id}-${network}.json`); }
  async gql(query,variables={}) {
    const r=await this.fetcher('https://api.buffer.com',{method:'POST',headers:{Authorization:'Bearer '+this.config.apiKey,'Content-Type':'application/json'},body:JSON.stringify({query,variables}),redirect:'error',signal:AbortSignal.timeout(45000)});
    const j=await r.json(); assert(r.ok && !j.errors?.length && j.data, 'Buffer request failed: HTTP '+r.status); return j.data;
  }
  async channel(network) {
    const j=await this.gql('query($input:ChannelInput!){channel(input:$input){id name service organizationId externalLink isDisconnected isLocked isQueuePaused}}',{input:{id:CHANNELS[network].id}});
    checkChannel(j.channel,network,this.config.organizationId); return j.channel;
  }
  async publish(source,network) {
    const file=this.file(source.id,network), old=read(file);
    if(old) { assert(old.instagram_media_id===source.instagram_media_id,'Source identity changed'); return old; }
    const samePost=this.records().find(r=>r.instagram_media_id===source.instagram_media_id && r.network===network);
    if(samePost) return samePost;
    const input=inputFor(source,network); await this.channel(network);
    for(const asset of input.assets) {
      const url=asset.image?.url||asset.video?.url;
      const r=await this.fetcher(url,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(30000)});
      const type=r.headers.get('content-type')||'';
      assert(r.ok && (asset.image?/^image\/(jpeg|png|webp)/:/^video\//).test(type),'Media unavailable or wrong MIME');
    }
    const record={source_id:source.id,instagram_media_id:source.instagram_media_id,network,kind:source.kind,input,status:'creating',created_at:new Date().toISOString(),checks:0};
    fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
    let fd; try { fd=fs.openSync(file,'wx',0o600); } catch(e) { if(e.code==='EEXIST') return read(file); throw e; }
    try {fs.writeFileSync(fd,JSON.stringify(record));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
    let saved=record;
    try {
      const j=await this.gql(`mutation($input:CreatePostInput!){createPost(input:$input){__typename ... on PostActionSuccess{post{${FIELDS}}} ... on MutationError{message}}}`,{input});
      if(j.createPost?.__typename!=='PostActionSuccess') {
        saved={...record,status:'rejected',message:String(j.createPost?.message||'Buffer rejected post').slice(0,300)};
        write(file,saved); return saved;
      }
      const post=j.createPost.post; assert(post?.id,'Missing Buffer receipt');
      saved={...record,post_id:post.id,status:'accepted'}; write(file,saved);
      return this.record(post,saved);
    } catch(e) {
      const latest=read(file)||saved;
      write(file,{...latest,status:latest.post_id?'needs_review':'uncertain',error:'Publication result requires reconciliation'});
      throw new Error('Publication result uncertain; automatic resend blocked');
    }
  }
  record(post,record) {
    const state=publicationState(post,record);
    const next={...record,status:state,provider_status:post.status,url:state==='published'?post.externalLink:null,sent_at:post.sentAt||null,checked_at:new Date().toISOString(),checks:(record.checks||0)+1};
    write(this.file(record.source_id,record.network),next); return next;
  }
  async poll(record) {
    const j=await this.gql(`query($input:PostInput!){post(input:$input){${FIELDS}}}`,{input:{id:record.post_id}});
    return this.record(j.post,record);
  }
  records() { const dir=path.join(this.root,'records');return fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>read(path.join(dir,f))):[]; }
}
module.exports={Publisher,CHANNELS,SOURCE_WORKFLOW,sourceFromExecution,inputFor,checkChannel,publicationState,write,read};
