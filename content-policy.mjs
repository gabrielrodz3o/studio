import {createHash} from 'node:crypto';
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
const norm=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
export const teachingKey=points=>createHash('sha256').update((points||[]).map(norm).sort().join('|')).digest('hex').slice(0,20);
export function contentRecord(script,job={}){
 const p=script.editorial||{},scenes=script.escenas||[],text=scenes.map(s=>s.voz||s.texto||s.titulo).filter(Boolean);
 return {job_id:job.id,creative_id:job.creative_id,brand_id:job.brand_id||script.brand_id,at:job.created_at,date:job.created_at?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santo_Domingo'}).format(new Date(job.created_at)):'',status:job.review?.status==='rejected'?'rejected':job.status,topic:p.topic||script.editorial_topic||script.evidencia?.label||script.nombre,title:p.title||scenes[0]?.titulo||script.titular,asset:p.asset||script.evidencia?.key,angle:p.angle||scenes[0]?.titulo,teaching_key:p.teaching_key||teachingKey(p.points||text),points:p.points||text,style:script.formato,kind:job.kind,story:job.kind==='historia_social'};
}
// Includes direct API/editor jobs, without approving them or creating calendar pieces.
export async function jobContentHistory(root){const dir=join(root,'.studio-state/jobs'),out=[];for(const name of await readdir(dir).catch(e=>{if(e.code==='ENOENT')return [];throw e})){if(!/^job_[a-f0-9-]{36}$/.test(name))continue;try{const job=JSON.parse(await readFile(join(dir,name,'job.json')));if(!['succeeded','queued','running'].includes(job.status))continue;const script=JSON.parse(await readFile(join(dir,name,'script.json')));out.push(contentRecord(script,job))}catch(e){if(e.code!=='ENOENT')throw e}}return out}
export function qualityDecision(job){
 const q=job.artifact?.quality,creative=job.artifact?.creative_quality;
 const reasons=[];
 if(job.kind==='video'&&!q)reasons.push('Falta el informe técnico del video');
 if(q&&(q.passed===false||(!q.status&&q.passed!==true)||['review','failed','blocked'].includes(q.status)||(q.warnings||[]).length))reasons.push('El control técnico requiere revisión: '+(q.warnings||[]).join('; '));
 if(creative?.status==='blocked')reasons.push(...creative.issues);
 return {allowed:reasons.length===0,reasons};
}
export function creativeIssues(script){
 const scenes=script.escenas||[],issues=[];
 const copy=[script.titular,script.subtitulo,...(script.slides||[]).flatMap(p=>[p.titulo,p.texto]),...(script.editorial?.points||[])].filter(Boolean).join(' ');
 const regulatory=copy.split(/[.!?]+/).filter(t=>/NCF identifica|e-CF corresponde|plazo legal|obligatori[oa]|certificad[oa] por|DGII exige/i.test(t));
 if(regulatory.some(t=>!(script.evidence_claims||[]).some(c=>c.verified&&c.reviewed_by&&norm(c.text)===norm(t)&&/^https:\/\/[^/]*dgii\.gov\.do\//i.test(c.source||''))))issues.push('La afirmación normativa requiere una fuente oficial revisada');
 const generic=/^(Una dificultad cotidiana|Qué necesitas resolver|Cómo puede ayudar|Edita este mensaje|Primer paso|Segundo paso|Tercer paso)$/i;
 if(scenes.some(s=>generic.test((s.titulo||'').trim())))issues.push('Título genérico de plantilla sin desarrollar');
 if(script.editorial?.commercial&&scenes.some(s=>s.tipo==='media'&&s.role!=='closing'&&!s.resource_id&&!s.media_url))issues.push('Demostración sin recurso visual');
 const teaching=scenes.filter(s=>s.rol!=='cierre'&&s.role!=='closing').map(s=>norm(s.voz||s.texto)).filter(Boolean);
 if(new Set(teaching).size<teaching.length)issues.push('Dos escenas repiten la misma explicación');
 return issues;
}
export function captionForChannel(caption,channel){
 // Preserve the message and CTA. Only remove irrelevant/repeated tag clutter.
 const tags=[...new Set(caption.match(/#[\p{L}\p{N}_]+/gu)||[])];
 const body=caption.replace(/#[\p{L}\p{N}_]+/gu,'').replace(/[ \t]+\n/g,'\n').trim();
 const selected=channel==='facebook'?tags.slice(0,2):channel==='tiktok'?tags.slice(0,4):tags.slice(0,5);
 return body+(selected.length?'\n\n'+selected.join(' '):'');
}

export function topicFamily(text){const s=norm(text);for(const [key,pattern]of [['merma',/merma|desperdic/],['receta',/receta|ingrediente|costo.*plato/],['cocina',/cocina|comanda|cebolla|modificador/],['cobros',/cobr|deben|vencim/],['mesas',/mesa|salon/],['cuentas',/cuenta|pago/],['reportes',/reporte|indicador|cifra|brut|neto/]])if(pattern.test(s))return key;return null}
