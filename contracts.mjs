import Ajv from 'ajv'
const ajv = new Ajv({allErrors:true,strict:true})
const id = {type:'string',minLength:1,maxLength:160}
const validateJob = ajv.compile({type:'object',additionalProperties:false,required:['brand_id','kind'],properties:{
  brand_id:id,kind:{enum:['video','imagen','carrusel','historia_social']},template_id:id,
  script:{type:'object'},voice:{type:'boolean'},subtitles:{type:'boolean'},allow_paid_voice:{type:'boolean'},
  brief:{type:'string',maxLength:2000},max_budget_usd:{type:'number',exclusiveMinimum:0,maximum:5},
  aspect:{enum:['vertical','horizontal','square','portrait']},preview:{type:'boolean'},
  campaign_id:id,concept_id:id,creative_id:id,parent_job_id:id,caption:{type:'string',maxLength:2200}
},oneOf:[{required:['script'],properties:{script:{}}},{required:['template_id'],properties:{template_id:{}}}]})
export function assertJob(input) {
  if(!validateJob(input)) throw Object.assign(Error('Solicitud inválida: '+ajv.errorsText(validateJob.errors,{separator:'; '})),{status:validateJob.errors.some(e=>['additionalProperties','oneOf'].includes(e.keyword))?400:422})
  return input
}
const schemas = new Map()
export function assertGenerated(schema, value) {
  const key=JSON.stringify(schema);let validate=schemas.get(key)
  if(!validate){validate=ajv.compile(schema);schemas.set(key,validate)}
  if(!validate(value))throw Error('Respuesta creativa inválida: '+ajv.errorsText(validate.errors,{separator:'; '}))
}
