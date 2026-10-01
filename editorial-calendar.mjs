import {teachingKey,jobContentHistory,topicFamily} from './content-policy.mjs';
import {videoEvidence} from './editorial-video.mjs';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const age=(a,b)=>(Date.parse(a)-Date.parse(b))/86400000;
export const editorialWeights={educativo:40,product_demo:30,venta_directa:20,entretenimiento:10};
export function chooseFeed(catalog,day,history=[],holiday=null,{video=false}={}){
 const recent=history.filter(h=>h.date<=day&&!h.story).map(h=>({...h,type:h.type==='social_proof'?'product_demo':h.type})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const lines=recent.filter(h=>catalog.some(c=>c.id===h.system_id)).slice(0,20);
 if(video)catalog=catalog.map(s=>({...s,topics:s.topics.filter(t=>videoEvidence[t.asset])})).filter(s=>s.topics.some(t=>t.tipo==='educativo'));
 const system=[...catalog].sort((a,b)=>((lines.length+1)*b.weight/100-lines.filter(h=>h.system_id===b.id).length)-((lines.length+1)*a.weight/100-lines.filter(h=>h.system_id===a.id).length))[0];
 const types=recent.filter(h=>editorialWeights[h.type]).slice(0,10);
 const type=holiday&&!video?'dia_festivo':video?'educativo':Object.keys(editorialWeights).sort((a,b)=>((types.length+1)*editorialWeights[b]/100-types.filter(h=>h.type===b).length)-((types.length+1)*editorialWeights[a]/100-types.filter(h=>h.type===a).length))[0];
 const topics=system.topics.filter(t=>t.tipo===type),past=recent.slice(0,40);
 const chosen=holiday&&!video?{id:'festivo-'+day,titulo:'Celebramos '+holiday.localName,consejos:['Acompañamos a los negocios y sus equipos en esta celebración.','ComandPOS by GCODE.'],asset:'none'}:topics.map(t=>({t,anglePenalty:past.some(h=>age(day,h.date)<7&&topicFamily(t.titulo)&&topicFamily(t.titulo)===topicFamily((h.title||'')+' '+(h.topic||'')))?1:0,count:past.filter(h=>h.topic===t.id||h.teaching_key===teachingKey(t.consejos)||norm(h.title)===norm(t.titulo)).length,last:past.findIndex(h=>h.topic===t.id||h.teaching_key===teachingKey(t.consejos)||norm(h.title)===norm(t.titulo))})).sort((a,b)=>a.count-b.count||a.anglePenalty-b.anglePenalty||b.last-a.last||a.t.id.localeCompare(b.t.id))[0]?.t;
 if(!chosen)throw Error('No hay tema editorial disponible');
 const commercial=['product_demo','venta_directa'].includes(type),cta=commercial?'Solicita tu demo':type==='educativo'?'Guarda esta guía':type==='entretenimiento'?'¿Te ha pasado?':'ComandPOS by GCODE';
 const layouts=commercial&&chosen.asset!=='none'?['product-scene','hero','photo-first']:['hero','photo-first'];
 return {version:3,teaching_key:teachingKey(chosen.consejos),intent:chosen.intent||'teach',date:day,system_id:system.id,system_name:system.name,type,topic:chosen.id,title:chosen.titulo,body:chosen.explicacion||chosen.consejos[0],points:chosen.consejos,humor:chosen.humor,asset:chosen.asset,cta,commercial,source:holiday?.source||system.source,layout:layouts.find(l=>l!==recent[0]?.layout)||layouts[0],holiday:holiday?.localName||null,repeat:past.some(h=>h.topic===chosen.id)};
}
export function chooseStory(catalog,day,hour,history=[],{theme=null}={}){
 if(![13,18].includes(hour))throw Error('Horario de historia inválido');
 const recent=history.filter(h=>h.date<=day&&age(day,h.date)<14),week=recent.filter(h=>age(day,h.date)<7),today=recent.filter(h=>h.date===day),slot=hour===13?'morning':'evening';
 const morning=hour===18?chooseStory(catalog,day,13,history.filter(h=>!(h.story&&h.date===day))):null;
 const index=Math.floor(Date.parse(day)/86400000);
 const linked=theme?catalog.filter(t=>new RegExp(t.pattern,'i').test((theme.title||'')+' '+(theme.topic||''))):[];
 const preferred=linked.length?linked:theme?catalog.filter(t=>t.asset===theme.asset):[];
 const coordinated=preferred.filter(t=>!recent.some(h=>h.title===t[slot].title));
 const pool=coordinated.length?coordinated:catalog.filter(t=>t.id!==morning?.topic&&!today.some(h=>h.topic===t.id||new RegExp(t.pattern,'i').test(h.title||'')));
 const candidates=pool.map((t,i)=>({t,score:(recent.some(h=>h.title===t[slot].title)?1000:0)+(week.some(h=>h.topic===t.id)?100:0)+(recent.filter(h=>h.hour===18).slice(-2).some(h=>h.asset===t.asset)?30:0)+((i-index*(hour===13?5:7))%catalog.length+catalog.length)%catalog.length})).sort((a,b)=>a.score-b.score);
 const item=candidates[0];if(!item||item.score>=1000)throw Error('Catálogo de historias agotado: revisar títulos de los últimos 14 días');
 const copy=item.t[slot],layouts=hour===13?['question','checklist','steps']:['spotlight','detail','walkthrough'];let layout=layouts[index%3];if(layout===recent.filter(h=>h.hour===hour).at(-1)?.layout)layout=layouts[(layouts.indexOf(layout)+1)%3];
 return {version:3,theme_id:coordinated.length?(theme.topic||theme.title):null,teaching_key:teachingKey([copy.body,...(copy.points||[])]),date:day,story:true,hour,topic:item.t.id,title:copy.title,body:copy.body,points:copy.points||[],cta:copy.cta,asset:item.t.asset,commercial:hour===18,layout,source:'Catálogo editorial ComandPOS v16 migrado; requiere revisión de pieza',type:hour===13?'educativo':'product_demo',system_id:1,system_name:'ComandPOS'};
}
export class EditorialCalendar{
 constructor(root,{fetcher=fetch}={}){this.root=root;this.fetcher=fetcher}
 async init(){this.catalog=await json(join(this.root,'editorial/feed-catalog.json'));this.stories=await json(join(this.root,'editorial/story-catalog.json'));return this}
 async holidays(year){const dir=join(this.root,'.studio-state/editorial'),file=join(dir,'holidays-'+year+'.json');let cached;try{cached=await json(file)}catch(e){if(e.code!=='ENOENT')throw e}if(cached&&Date.now()-Date.parse(cached.checked_at)<7*86400000)return cached;
 try{const source='https://date.nager.at/api/v3/PublicHolidays/'+year+'/DO',r=await this.fetcher(source,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('HTTP '+r.status);const days=await r.json();if(!Array.isArray(days)||!days.length||days.some(h=>!new RegExp('^'+year+'-\\d{2}-\\d{2}$').test(h.date)||typeof h.localName!=='string'||h.countryCode!=='DO'))throw Error('Calendario externo inválido');const value={checked_at:new Date().toISOString(),source,days};await mkdir(dir,{recursive:true});const temp=file+'.'+randomUUID();await writeFile(temp,JSON.stringify(value));await rename(temp,file);return value}catch(e){if(cached)return {...cached,warning:'Feriados con caché anterior: '+e.message};return {days:[],warning:'No se pudieron comprobar los feriados: '+e.message}}}
 async plan(slot,slots,marketing){let legacy=[];try{legacy=await json(join(this.root,'.studio-state/editorial/legacy-history.json'))}catch(e){if(e.code!=='ENOENT')throw e}
 const current=slots.filter(s=>s.id!==slot.id&&s.editorial).map(s=>s.editorial);
 // Imported receipts contribute history only, never approvals or scheduled deliveries.
 const known=new Set(legacy.map(h=>h.post_id));const published=marketing.deliveries.filter(d=>d.brand_id==='comandpos'&&d.channel==='instagram'&&d.status==='published'&&!known.has(d.post_id)).map(d=>({date:String(d.published_at||d.at).slice(0,10),title:String(d.caption||'').split('\n')[0]}));
 const jobHistory=(await jobContentHistory(this.root)).filter(h=>h.brand_id==='comandpos'&&h.status!=='rejected');
 const history=[...legacy,...published,...current,...jobHistory];
 if(slot.hour){const theme=slots.find(s=>s.date===slot.date&&s.key==='video'&&s.editorial)?.editorial||slots.find(s=>s.date===slot.date&&s.key==='feed'&&s.editorial)?.editorial;return chooseStory(this.stories,slot.date,slot.hour,history,{theme})}
 const cal=await this.holidays(slot.date.slice(0,4)),holiday=cal.days.find(h=>h.date===slot.date);
 return {...chooseFeed(this.catalog,slot.date,history,holiday?{...holiday,source:cal.source}:null,{video:slot.kind==='video'}),...(cal.warning?{warning:cal.warning}:{})};
 }
}
export function editorialScript(plan,kind,key){
 const caption=[plan.title,plan.humor?'Expectativa: '+plan.humor.expectativa+'\nRealidad: '+plan.humor.realidad:plan.story?plan.body:plan.points.map((p,i)=>(i+1)+'. '+p).join('\n'),plan.commercial?(plan.asset&&plan.asset!=='none'?'Captura del sistema; datos de ejemplo. Disponibilidad según plan y configuración.':'Disponibilidad según plan y configuración.'):null,plan.cta+(plan.commercial?' · WhatsApp +1 849 540 6093':'')].filter(Boolean).join('\n\n')+(plan.story?'':'\n\n#ComandPOS #RestaurantesRD '+(plan.system_id===2?'#FacturacionElectronicaRD':plan.system_id===5?'#GestionDeRestaurantes':/cocina|comanda|pedido/i.test(plan.title)?'#ComandasDigitales':'#GestionDeRestaurantes')+' #NegociosRD');
 const claims=[{id:'editorial-source',text:plan.body,source:plan.source}];
 const slides=kind==='carrusel'?[{titulo:plan.title,texto:plan.points[0]},{titulo:plan.humor?'Lo que esperabas':'En la práctica',texto:plan.humor?.expectativa||plan.points[1]},{titulo:plan.humor?'Lo que pasó':'Antes de continuar',texto:plan.humor?.realidad||plan.points[2]||plan.points[0]},{titulo:plan.cta,texto:plan.commercial?'Explora las funciones según tu plan y configuración.':'Una guía para revisar con tu equipo.'}].map(p=>({...p,claim_ids:['editorial-source']})):[];
 return {nombre:'calendar-'+createHash('sha256').update(key).digest('hex').slice(0,20),brand_id:'comandpos',layout:'brand',tipo:kind,titular:plan.title,subtitulo:plan.body,caption,cta:plan.cta,slides,evidence_claims:claims,claim_ids:['editorial-source'],editorial:plan};
}
