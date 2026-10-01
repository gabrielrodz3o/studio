import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, copyFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validar } from './validar.mjs'

test('guiones inválidos no llegan al render', () => {
  assert.throws(() => validar({nombre: '../fuera', escenas: []}))
  assert.throws(() => validar({nombre: 'prueba', escenas: [{tipo: 'grafica_ventas', dur: 2, rotulo: 'Ventas', barras: [['A', 0]]}]}))
  assert.doesNotThrow(() => validar({nombre: 'prueba', escenas: [{tipo: 'transicion', dur: 3, texto: 'Una idea'}]}))
})

test('capturas comerciales conservan sus límites y solo usan recursos locales', () => {
  const base = {nombre:'comercial-test', formato:'comercial', escenas:[{tipo:'comercial_foco', dur:5, titulo:'Reporte', etiqueta:'DEMO', imagen:'assets/reportes-real.webp', ancho:1637, alto:829, recorte:[410,0,400,140]}]}
  assert.doesNotThrow(() => validar(base))
  for (const value of [[1600,0,400,140], [0,0,-20,140], [0,0,400,NaN]]) {
    const sb=structuredClone(base); sb.escenas[0].recorte=value
    assert.throws(() => validar(sb), /recorte/)
  }
  const externo=structuredClone(base);externo.escenas[0].imagen='https://example.com/captura.png'
  assert.throws(() => validar(externo), /imagen local/)
  const ruta=structuredClone(base);ruta.escenas[0].imagen='assets/../clave.png'
  assert.throws(() => validar(ruta), /imagen local/)
  assert.throws(() => validar({...base,formato:'desconocido'}), /Formato/)
})

test('voz conserva tareas, limita reintentos y evita POST duplicados', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'studio-voz-test-'))
  const oldFetch = globalThis.fetch, oldKey = process.env.KIE_API_KEY
  process.env.KIE_API_KEY = 'test-sin-red'
  try {
    await copyFile(new URL('./voz.mjs', import.meta.url), join(dir, 'voz.mjs'))
    await copyFile(new URL('./file-lock.mjs', import.meta.url), join(dir, 'file-lock.mjs'))
    await copyFile(new URL('./budget.mjs', import.meta.url), join(dir, 'budget.mjs'))
    const {voz} = await import(pathToFileURL(join(dir, 'voz.mjs')))
    const v = {model:'test',voice_name:'test'}
    let posts = 0
    globalThis.fetch = async (url, options) => {
      if (options?.method === 'POST') { posts++; return Response.json({code:200,data:{taskId:'t'+posts}}) }
      return Response.json({code:200,data:{state:'fail',failMsg:'generate task timeout'}})
    }
    await assert.rejects(voz('timeout terminal',v), /rechazó/)
    assert.equal(posts,3)
    await assert.rejects(voz('timeout terminal',v), /rechazó/)
    assert.equal(posts,3,'reiniciar no reinicia el presupuesto de reintentos')
    globalThis.fetch = async () => { posts++; throw new Error('conexión perdida') }
    await assert.rejects(voz('respuesta perdida',v), /conexión perdida/)
    const before=posts
    await assert.rejects(voz('respuesta perdida',v), /resultado desconocido/)
    assert.equal(posts,before,'un POST ambiguo nunca se repite automáticamente')
    await assert.rejects(voz('sin caché',v,{cacheOnly:true}), /Falta audio/)
    assert.equal(posts,before,'modo caché no hace llamadas de red')
    assert.ok(!(await readdir(join(dir,'voz'))).some(f=>f.endsWith('.lock')))
  } finally {
    globalThis.fetch=oldFetch
    if(oldKey===undefined)delete process.env.KIE_API_KEY;else process.env.KIE_API_KEY=oldKey
    await rm(dir,{recursive:true,force:true})
  }
})

test('cached voice takes keep profile/text identity and need no provider',async t=>{
 const {mkdir}=await import('node:fs/promises'),{execFile}=await import('node:child_process'),{promisify}=await import('node:util');const dir=await mkdtemp(join(tmpdir(),'studio-takes-'));t.after(()=>rm(dir,{recursive:true,force:true}));for(const f of ['voz.mjs','budget.mjs','file-lock.mjs'])await copyFile(new URL('./'+f,import.meta.url),join(dir,f));const {voiceTakes,voiceKey}=await import(pathToFileURL(join(dir,'voz.mjs')));await mkdir(join(dir,'voz'));const text='Registra el pedido',profile={model:'fixture',voice_name:'speaker'};for(const take of [0,2])await promisify(execFile)('ffmpeg',['-v','error','-y','-f','lavfi','-i','sine=frequency=440:duration=1',join(dir,'voz',voiceKey(text,profile,take)+'.wav')]);const takes=await voiceTakes(text,profile);assert.deepEqual(takes.map(t=>t.take),[0,2]);assert.ok(takes.every(t=>t.duration===1));assert.equal((await voiceTakes(text+' nuevo',profile)).length,0);assert.equal((await voiceTakes(text,{...profile,voice_name:'other'})).length,0);
});
