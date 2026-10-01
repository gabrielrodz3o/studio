import {hash} from './releases.mjs'
import {similarity,selectResources} from './editorial.mjs'
import {automaticBrief} from './styles.mjs'

export function campaignContext(data, brandId, campaignId) {
  if(!campaignId)return null
  const campaign=data.campaigns.find(c=>c.id===campaignId&&c.brand_id===brandId)
  if(!campaign)throw Object.assign(Error('Campaña no disponible para esta marca'),{status:422})
  return campaign
}
export function proposals(data,brand,history=[],campaign=null) {
  const claims=(brand.claims||[]).filter(c=>c.verified&&c.source&&c.reviewed_by)
  const facts=claims.length?claims.map(c=>({topic:c.text,claim_id:c.id,source:c.source})):String(brand.facts||'').split(/\n|;|(?<=\.)\s+/).map(topic=>({topic:topic.trim(),source:'Ficha de marca; revisar evidencia'})).filter(c=>c.topic.length>8)
  if(!facts.length)throw Error('Completa los hechos comprobados de la marca')
  const published=data.deliveries.filter(d=>d.brand_id===brand.id&&d.status==='published').sort((a,b)=>String(b.published_at||b.at).localeCompare(String(a.published_at||a.at))).slice(0,30)
  const past=[...history.filter(h=>h.brand_id===brand.id).sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,Math.max(1,facts.length-1)).map(h=>h.topic||h.idea),...published.map(d=>d.caption)]
  const base=automaticBrief(brand,history)
  const angles=[{id:'uso',label:'Una situación cotidiana',instruction:'Explica una situación ilustrativa donde se utiliza la función.'},{id:'pregunta',label:'Una duda frecuente',instruction:'Formula una duda y responde únicamente con el hecho disponible.'},{id:'distincion',label:'Qué permite y qué no afirma',instruction:'Aclara el alcance del hecho sin inventar limitaciones ni funciones adicionales.'}];
  return facts.flatMap(f=>angles.map(angle=>{
    const repetition=Math.max(0,...past.filter(Boolean).map(t=>similarity(f.topic,t))),relevance=similarity(f.topic,(campaign?.objective||'')+' '+(campaign?.offer||''))
    const idea=`Enfoque editorial: ${angle.instruction} Crea una pieza para ${campaign?.audience||brand.audience} sobre este hecho de la ficha de marca (requiere revisión de evidencia): ${f.topic}. Objetivo editorial: ${campaign?.objective||'Explicar una función comprobada'}. No inventes resultados, precios ni funciones. Cierra con ${brand.cta}.`
    return {...f,angle:angle.id,angle_label:angle.label,id:hash({brand:brand.id,campaign:campaign?.id,topic:f.topic,angle:angle.id}).slice(0,20),style:brand.id==='comandpos'&&/reportes|venta neta/i.test(f.topic)?'comercial':base.style,idea,score:relevance*.5-repetition*2-history.filter(h=>h.brand_id===brand.id&&h.topic===f.topic&&h.angle===angle.id).length,repetition,reason:angle.label+'. '+(relevance?'Relacionado con el objetivo de campaña. ':'Hecho disponible en la marca. ')+(repetition>.6?'Se parece a contenido reciente: cambia el enfoque.':'Menor repetición en el historial consultado.'),resources:selectResources(brand.id,f.topic,data.assets).map(a=>({id:a.id,name:a.name,type:a.type,score:a.score}))}
  })).filter(p=>!(data.pieces||[]).some(piece=>piece.brand_id===brand.id&&piece.campaign_id===campaign?.id&&piece.concept_id===p.id&&(!piece.automation_slot||!piece.created_at||Date.parse(piece.created_at)>Date.now()-48*3600000))).sort((a,b)=>b.score-a.score).slice(0,3)
}

export function deriveCampaign(data,campaign,proposal) {
  // These are editable briefs, never approved or automatically scheduled publications.
  return [['video','Demostración con una acción visible'],['carrusel','Cuatro páginas: pregunta, explicación, ejemplo y cierre'],['imagen','Un solo hecho y una llamada a la acción'],['historia_social','Una pregunta breve y una respuesta visual']].map(([kind,approach])=>({
    brand_id:campaign.brand_id,campaign_id:campaign.id,concept_id:proposal.id,kind,channel:'instagram',
    title:proposal.topic.slice(0,140)+' · '+kind,brief:proposal.idea+' Formato: '+approach+'.',caption:'',scheduled_at:null
  }))
}
