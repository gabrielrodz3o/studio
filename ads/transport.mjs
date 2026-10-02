import {fail,requireValue} from './contracts.mjs'
// Never expose provider bodies, request URLs, headers or credentials in errors.
export class AdsProviderError extends Error{
 constructor(status,code,uncertain=false){super(status===401||status===403?'Acceso publicitario denegado o vencido':`Proveedor publicitario: HTTP ${status||'sin respuesta'}${code?` (código ${String(code).replace(/[^\d]/g,'').slice(0,10)})`:''}`);this.status=502;this.provider_status=status;this.provider_code=code;this.uncertain=uncertain}
}
export class Transport{
 constructor({token,platform='meta',fetchImpl=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),writable=false,version='v24.0'}){requireValue(typeof token==='string'&&token.length>10,'Credencial Ads no configurada',503);this.version=version;this.token=token;this.platform=platform;this.fetch=fetchImpl;this.sleep=sleep;this.writable=writable}
 async call(path,params={},method='GET'){
  requireValue(method==='GET'||method==='POST'&&this.writable,'Transporte de solo lectura',403);
  requireValue(/^[a-zA-Z0-9_./-]+$/.test(path)&&!path.includes('..')&&!path.startsWith('/'),'Ruta publicitaria inválida');
  const url=new URL(this.platform==='meta'?`https://graph.facebook.com/${this.version}/${path}`:`https://business-api.tiktok.com/open_api/v1.3/${path}`);
  const headers=this.platform==='meta'?{Authorization:'Bearer '+this.token}:{'Access-Token':this.token};
  let body;
  if(method==='GET')for(const [k,v] of Object.entries(params)){requireValue(!['access_token','appsecret_proof'].includes(k),'Parámetro secreto no admitido');url.searchParams.set(k,typeof v==='object'?JSON.stringify(v):String(v))}
  else if(params instanceof FormData)body=params;
  else {body=new URLSearchParams();for(const [k,v] of Object.entries(params))body.set(k,typeof v==='object'?JSON.stringify(v):String(v));}
  for(let attempt=0;attempt<3;attempt++){
   let response,data;
   try{response=await this.fetch(url,{method,headers,body,redirect:'error',signal:AbortSignal.timeout(30000)});data=await response.json()}
   catch{if(method==='GET'&&attempt<2){await this.sleep(250*2**attempt);continue}throw new AdsProviderError(0,null,method!=='GET')}
   const code=data?.error?.code??(this.platform==='tiktok'?data.code:0);
   if(!response.ok||code){if(method==='GET'&&(response.status===429||response.status>=500||[4,17,32,613].includes(code))&&attempt<2){await this.sleep(250*2**attempt);continue}throw new AdsProviderError(response.status,code,method!=='GET'&&(response.status>=500||response.status===429||[1,2].includes(code)))}
   return data;
  }
 }
 async pages(path,params={},limit=20){
  let after,rows=[],complete=true;const seen=new Set();
  for(let i=0;i<limit;i++){
   const d=await this.call(path,{...params,...(after?{after}:{}),limit:100});requireValue(Array.isArray(d.data),'Respuesta de lista inválida',502);rows.push(...d.data);
   if(!d.paging?.next)return {rows,complete};
   after=d.paging.cursors?.after;if(typeof after!=='string'||seen.has(after))return {rows,complete:false};seen.add(after);
  }return {rows,complete:false};
 }
}
