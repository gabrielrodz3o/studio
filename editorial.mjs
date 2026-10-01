// Checks are intentionally conservative. Passing does not establish factual truth.
export function editorialIssues(value) {
  const strings=[]
  function visit(x,key=''){if(['warnings','restrictions','facts'].includes(key))return;if(typeof x==='string')strings.push(x);else if(Array.isArray(x))x.forEach(y=>visit(y,key));else if(x&&typeof x==='object')for(const [k,v]of Object.entries(x))visit(v,k)}
  visit(value)
  const text=strings.join('\n'),issues=[]
  for(const [pattern,message]of [
    [/\bgarantiz\w*|\bsin (?:errores|retrasos|demoras)\b|\bal instante\b/i,'Promesa de resultado sin respaldo'],
    [/\bdemo (?:gratis|gratuita)\b/i,'Oferta gratuita no autorizada'],
    [/\bcaso real\b|\btestimonio real\b/i,'Caso o testimonio requiere evidencia'],
    [/\d+(?:[.,]\d+)?\s*%/,'Porcentaje requiere evidencia']
  ])if(pattern.test(text))issues.push(message)
  return [...new Set(issues)]
}
export function assertEditorial(value){const issues=editorialIssues(value);if(issues.length)throw Error('Revisión editorial: '+issues.join('; '))}
export function words(text){return new Set(String(text||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().match(/[a-z0-9]{4,}/g)||[])}
export function similarity(a,b){const x=words(a),y=words(b),n=[...x].filter(w=>y.has(w)).length;return n/Math.max(1,new Set([...x,...y]).size)}
export function selectResources(brandId, topic, assets=[]){return assets.filter(a=>a.brand_id===brandId&&a.type!=='audio'&&(!a.expires_at||Date.parse(a.expires_at)>Date.now())).map(a=>({...a,score:similarity(topic,a.name+' '+a.tags)})).filter(a=>a.score>0).sort((a,b)=>b.score-a.score).slice(0,3)}
