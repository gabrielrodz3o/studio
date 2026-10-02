import sdk from 'facebook-nodejs-business-sdk'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {Transport} from './transport.mjs'
import {requireValue,digits,stamp} from './contracts.mjs'
export const META_VERSION='v24.0'
export class MetaAds{
 constructor(options){this.transport=new Transport({...options,version:META_VERSION});this.account=options.account_id;requireValue(/^act_\d+$/.test(this.account),'Cuenta Meta inválida');
  // Use SDK object contracts, never its global singleton/debug/crash reporter transport.
  this.api=new sdk.FacebookAdsApi(options.token,'es_LA',false);
  this.api.call=async(method,path,params={})=>{requireValue(Array.isArray(path),'Ruta SDK no admitida');const d=await this.transport.call(path.join('/'),params,method);return {...d,paging:d.paging?.next?{next:path,params:{...params,after:d.paging.cursors?.after}}:undefined}};
  this.object=new sdk.AdAccount(this.account,{},undefined,this.api);
 }
 async verify(){const c=await this.transport.call(this.account,{fields:'id,name,account_status,currency,timezone_name'});requireValue(c.id===this.account&&/^[A-Z]{3}$/.test(c.currency||'')&&typeof c.timezone_name==='string','Cuenta devuelta no coincide',502);return {id:c.id,name:String(c.name||'').slice(0,150),currency:c.currency,timezone:c.timezone_name,account_status:c.account_status,verified_at:stamp(),verification:'account_read_verified',api_version:META_VERSION}}
 async campaigns(){const cursor=this.object.getCampaigns(['id','name','status','effective_status','objective'],{limit:100},false);const rows=[];let complete=false;for(let i=0;i<20;i++){await cursor.next();rows.push(...cursor.map(c=>({id:c.id,name:c.name,status:c.status,effective_status:c.effective_status,objective:c.objective})));if(!cursor.hasNext()){complete=true;break}}return {rows,complete}}
 async inventory(){const result={campaigns:await this.campaigns()};for(const [key,fields] of [['adsets','id,name,campaign_id,status,effective_status,lifetime_budget,daily_budget,start_time,end_time,attribution_spec'],['ads','id,name,campaign_id,adset_id,status,effective_status,creative{id}']]){result[key]=await this.transport.pages(`${this.account}/${key}`,{fields})}return result}
 async insights(since,until){return this.transport.pages(`${this.account}/insights`,{fields:'account_id,account_currency,campaign_id,adset_id,ad_id,date_start,date_stop,spend,impressions,clicks,reach,actions,action_values',level:'ad',time_range:{since,until},time_increment:1,use_unified_attribution_setting:true})}
 async inspect(id,type){digits(id);const fields=type==='campaign'?'id,account_id,status,effective_status,objective,name,special_ad_categories':type==='adset'?'id,account_id,campaign_id,status,effective_status,lifetime_budget,start_time,end_time,targeting,optimization_goal,billing_event':type==='creative'?'id,account_id,object_story_spec':type==='media'?'id,status':'id,account_id,adset_id,status,effective_status,creative{id}';const value=await this.transport.call(id,{fields});if(type!=='media')requireValue(String(value.account_id)===this.account.slice(4),'Objeto ajeno a la cuenta',403);return value}
 async image(file){const bytes=await readFile(file.path);requireValue(createHash('sha256').update(bytes).digest('hex')===file.sha256,'El recurso cambió');requireValue(bytes.length<=30*1024*1024,'Imagen demasiado grande');const form=new FormData();form.set('filename',new Blob([bytes]),'studio.jpg');const r=await this.transport.call(this.account+'/adimages',form,'POST');const value=Object.values(r.images||{})[0];requireValue(/^[a-f0-9]{32,64}$/.test(value?.hash||''),'Respuesta de imagen incierta',502);return {id:value.hash}}
 async video(file){const bytes=await readFile(file.path);requireValue(createHash('sha256').update(bytes).digest('hex')===file.sha256,'El video cambió');requireValue(bytes.length<=150*1024*1024,'Video demasiado grande');const form=new FormData();form.set('source',new Blob([bytes]),'studio.mp4');return this.transport.call(this.account+'/advideos',form,'POST')}
 async create(phase,draft,ids,artifact){const c=draft.config,n=c.name+' · '+draft.hash.slice(0,10);
  if(phase==='media')return draft.snapshot.kind==='video'?this.video(await artifact(draft.snapshot.job_id,'video',draft.snapshot.files[0].sha256)):this.image(await artifact(draft.snapshot.job_id,'image-1',draft.snapshot.files[0].sha256));
  if(phase==='cover')return this.image(await artifact(draft.snapshot.job_id,'cover',draft.snapshot.cover_sha256));
  if(phase==='campaign')return this.transport.call(this.account+'/campaigns',{name:n,objective:c.objective,status:'PAUSED',special_ad_categories:[]},'POST');
  if(phase==='adset')return this.transport.call(this.account+'/adsets',{name:n,campaign_id:ids.campaign,status:'PAUSED',lifetime_budget:c.budget_minor,start_time:c.start_time,end_time:c.end_time,billing_event:c.billing_event,optimization_goal:c.optimization_goal,bid_strategy:'LOWEST_COST_WITHOUT_CAP',targeting:{geo_locations:{countries:c.countries},age_min:c.age_min,age_max:c.age_max,publisher_platforms:c.platforms}},'POST');
  if(phase==='creative'){
   const object_story_spec={page_id:c.page_id,...(c.instagram_actor_id?{instagram_actor_id:c.instagram_actor_id}:{})};
   if(draft.snapshot.kind==='video'){const v=await this.inspect(ids.media,'media');requireValue(v.status?.video_status==='ready','Video aún procesándose; reanuda más tarde',409);object_story_spec.video_data={video_id:ids.media,image_hash:ids.cover,message:c.copy,call_to_action:{type:'LEARN_MORE',value:{link:c.destination}}}}
   else object_story_spec.link_data={image_hash:ids.media,link:c.destination,message:c.copy,call_to_action:{type:'LEARN_MORE',value:{link:c.destination}}};
   return this.transport.call(this.account+'/adcreatives',{name:n,object_story_spec},'POST');
  }
  if(phase==='ad')return this.transport.call(this.account+'/ads',{name:n,adset_id:ids.adset,creative:{creative_id:ids.creative},status:'PAUSED'},'POST');
  throw Error('Fase no admitida');
 }
 async setStatus(id,status){digits(id);requireValue(['ACTIVE','PAUSED'].includes(status),'Estado inválido');return this.transport.call(id,{status},'POST')}
}
