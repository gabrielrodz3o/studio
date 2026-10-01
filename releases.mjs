import {createHash} from 'node:crypto'

export const canonical = value => JSON.stringify(sort(value))
function sort(value) {
  return Array.isArray(value) ? value.map(sort) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, sort(value[k])])) : value
}
export const hash = value => createHash('sha256').update(canonical(value)).digest('hex')
export function publicationBundle(piece, job, brand, account) {
  const files = job.kind === 'video'
    ? [{kind:'video',sha256:job.artifact?.sha256}]
    : (job.artifact?.images || []).map(x => ({kind:'image',index:x.index,sha256:x.sha256}))
  if (!files.length || files.some(x => !/^[a-f0-9]{64}$/.test(x.sha256 || ''))) throw Error('El archivo necesita una huella verificada antes de aprobar la publicación')
  let caption = piece.caption.trim()
  const aiVoice = job.kind === 'video' && job.options?.voice === true
  if (aiVoice && !/narración generada con ia\./i.test(caption)) caption += '\n\nNarración generada con IA.'
  const captionSupported=!(['facebook','instagram'].includes(piece.channel)&&piece.kind==='historia_social');if(!captionSupported)caption='';
  if(caption.length>2200)throw Error('El texto final con su declaración supera 2200 caracteres')
  return {schema_version:1,piece_id:piece.id,job_id:job.id,brand_id:piece.brand_id,
    ...(piece.automation_slot?{scheduled_at:piece.scheduled_at}:{}),brand_hash:hash(brand),channel:piece.channel,account,kind:piece.kind,caption,caption_supported:captionSupported,
    files,resources:job.resources||[],cover_sha256:job.artifact?.cover_sha256 || null,ai_voice:aiVoice}
}
export function sameBundle(release, bundle) {return release?.status === 'approved' && release.hash === hash(bundle)}
