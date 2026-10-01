export const HISTORY_TIMEZONE='America/Santo_Domingo'
export function day(value){if(!value||!Number.isFinite(Date.parse(value)))return '';const p=new Intl.DateTimeFormat('en-CA',{timeZone:HISTORY_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));return ['year','month','day'].map(k=>p.find(p=>p.type===k).value).join('-')}
export function dateLabel(value){return value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('es-DO',{timeZone:HISTORY_TIMEZONE,dateStyle:'medium',timeStyle:'short'}):'Sin registro'}
export function publicationsFor(deliveries,jobId){return deliveries.filter(d=>d.job_id===jobId).map(d=>({id:d.id,channel:d.channel,status:d.status,scheduled_at:d.scheduled_at||null,published_at:d.published_at||null,confirmed_at:d.confirmed_at||(d.status==='published'?d.updated_at:null)||null,url:d.url||null,post_id:d.post_id||null}))}
export function matchesHistory(item,{from='',to='',dateType='created_at',channel='',status=''}={}){
 if(from&&to&&from>to)return false;
 const publications=item.publications||[],events=channel?publications.filter(p=>p.channel===channel):publications;
 if(channel&&!events.length)return false;
 const published=events.filter(p=>p.status==='published');
 if(status==='published'&&!published.length)return false;
 if(status==='unpublished'&&published.length)return false;
 if(status&& !['published','unpublished'].includes(status)&&!events.some(p=>p.status===status))return false;
 if(!from&&!to)return true;
 const inRange=value=>{const d=day(value);return !!d&&(!from||d>=from)&&(!to||d<=to)};
 if(dateType==='published_at')return published.some(p=>inRange(p.published_at));
 if(dateType==='scheduled_at')return events.some(p=>inRange(p.scheduled_at));
 return inRange(item.created_at);
}
