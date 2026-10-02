import {hash} from '../releases.mjs'
export {hash}
export const stamp=()=>new Date().toISOString()
export const fail=(status,message)=>Object.assign(new Error(message),{status})
export function requireValue(ok,message,status=422){if(!ok)throw fail(status,message)}
export function text(value,max=200){requireValue(typeof value==='string'&&value.trim().length>0&&value.length<=max,'Texto requerido o demasiado largo');return value.trim()}
export function digits(value){requireValue(typeof value==='string'&&/^\d{1,40}$/.test(value),'Identificador remoto inválido');return value}
export function exactDecimal(value){requireValue(typeof value==='string'&&/^\d{1,18}(\.\d{1,6})?$/.test(value),'Importe decimal inválido');return value}
export function sumDecimals(values){const parts=values.map(v=>exactDecimal(v).split('.')),scale=Math.max(0,...parts.map(p=>(p[1]||'').length));const units=parts.reduce((n,[a,b=''])=>n+BigInt(a+b.padEnd(scale,'0')),0n).toString().padStart(scale+1,'0');return scale?units.slice(0,-scale)+'.'+units.slice(-scale):units}
export function date(value){requireValue(typeof value==='string'&&/^\d{4}-\d\d-\d\d$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value,'Fecha inválida');return value}
export function configuration(input){
 requireValue(input&&typeof input==='object','Falta configuración');
 const allowed=['name','destination','copy','page_id','instagram_actor_id','countries','age_min','age_max','platforms','budget_minor','currency','start_time','end_time'];
 requireValue(Object.keys(input).every(k=>allowed.includes(k)),'Configuración no admitida');
 const name=text(input.name,100),copy=text(input.copy,2200),destination=text(input.destination,1000),u=new URL(destination);
 requireValue(u.protocol==='https:'&&!u.username&&!u.password,'Usa un destino HTTPS sin credenciales');
 const countries=input.countries;requireValue(Array.isArray(countries)&&countries.length>0&&countries.length<=10&&countries.every(x=>/^[A-Z]{2}$/.test(x)),'Selecciona países válidos');
 const platforms=input.platforms||['facebook'];requireValue(Array.isArray(platforms)&&platforms.length>0&&platforms.every(x=>['facebook','instagram'].includes(x)),'Ubicaciones inválidas');
 const age_min=input.age_min??18,age_max=input.age_max??65;requireValue(Number.isInteger(age_min)&&Number.isInteger(age_max)&&age_min>=18&&age_max>=age_min&&age_max<=65,'Edad inválida');
 const budget_minor=input.budget_minor;requireValue(typeof budget_minor==='string'&&/^[1-9]\d{0,11}$/.test(budget_minor),'Presupuesto total: entero positivo en unidades menores');
 requireValue(/^[A-Z]{3}$/.test(input.currency||''),'Moneda inválida');
 requireValue([input.start_time,input.end_time].every(v=>typeof v==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(v)),'Las fechas necesitan zona horaria explícita');
 const start=new Date(input.start_time),end=new Date(input.end_time);requireValue(Number.isFinite(+start)&&Number.isFinite(+end)&&end>start&&end-start<=90*86400000,'Fechas inválidas: máximo 90 días');
 if(platforms.includes('instagram'))digits(input.instagram_actor_id);
 return {name,destination:u.href,copy,page_id:digits(input.page_id),...(platforms.includes('instagram')?{instagram_actor_id:digits(input.instagram_actor_id)}:{}),countries:[...new Set(countries)].sort(),age_min,age_max,platforms:[...new Set(platforms)].sort(),budget_minor,currency:input.currency,start_time:start.toISOString(),end_time:end.toISOString(),objective:'OUTCOME_TRAFFIC',optimization_goal:'LINK_CLICKS',billing_event:'IMPRESSIONS',budget_type:'lifetime'};
}
export function principalScope(principal,scope){
 if(principal.role==='admin')return;
 if(principal.role==='integration'&&principal.scopes?.includes(scope))return;
 if(scope==='ads.read'&&['editor','viewer'].includes(principal.role))return;
 if(scope==='ads.draft'&&principal.role==='editor')return;
 throw fail(403,'No tienes permiso para esta acción publicitaria');
}
export function canAccess(connection,principal){return principal.role==='admin'||(principal.role==='integration'?(principal.ad_connections?.includes(connection.id)||(principal.automated_ads_sync===true&&connection.auto_sync===true&&principal.scopes?.every(s=>['ads.read','ads.sync'].includes(s)))):connection.allowed_users?.includes(principal.username))}
export function publicConnection(c){const {credential_ref,allowed_users,...visible}=c;return visible}
