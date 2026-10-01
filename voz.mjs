// Voz de GCODE Studio con kie.ai (Gemini TTS). Mismas reglas que videos/tutoriales/voz.mjs:
// cada frase se pide una sola vez (caché por texto + voz), el taskId se guarda en cuanto llega
// Una espera local conserva la tarea. Solo un timeout terminal del proveedor permite otra creación.
import { readFile, writeFile, mkdir, access, rename, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Budget } from './budget.mjs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const DIR = dirname(fileURLToPath(import.meta.url))
const CACHE = join(DIR, 'voz')
const API = 'https://api.kie.ai/api/v1/jobs'
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const existe = (f) => access(f).then(() => true, () => false)

export async function perfil(nombre = 'n8n') {
  if (!['n8n','original'].includes(nombre)) throw new Error('Perfil de voz desconocido')
  return JSON.parse(await readFile(join(DIR, nombre === 'original' ? 'voz-perfil-original.json' : 'voz-perfil.json'), 'utf8'))
}

async function clave() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY.trim()
  return (await readFile(join(DIR, '..', 'tutoriales', 'clave-kie.txt'), 'utf8')).trim()
}

async function pedir(url, opts, key) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, { ...opts, headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000) })
    const j = await r.json().catch(() => null)
    if ((r.status === 429 || j?.code === 429) && i < 5) { await dormir(5000 * (i + 1)); continue }
    if (!r.ok || !j || j.code !== 200) throw Object.assign(new Error(`kie: HTTP ${r.status}, código ${j?.code ?? 'desconocido'}`), { status: r.status, code: j?.code })
    return j.data
  }
}

async function guardar(path, value) {
  const tmp = path + '.tmp'
  await writeFile(tmp, JSON.stringify(value, null, 2))
  await rename(tmp, path)
}

export async function duracion(f) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f])
  return Number(stdout.trim())
}

// Máximo tres tareas por frase, incluso al reiniciar el proceso. No reenvía POST ambiguos.
export async function voz(texto, v, { cacheOnly = false } = {}) {
  await mkdir(CACHE, { recursive: true })
  // Conserva la clave anterior para aprovechar los audios ya pagados.
  const id = createHash('sha256').update(JSON.stringify([texto, v.model, v.voice_name, v.audio_profile, v.sample_context, v.style, v.pace, ...(v.model==='google/gemini-3-1-flash-tts'?[v.temperature??.6,v.accent??null]:[])])).digest('hex').slice(0, 16)
  const limpio = join(CACHE, id + '.wav')
  if (await existe(limpio)) return { archivo: limpio, dur: await duracion(limpio), id }
  if (cacheOnly) throw new Error(`Falta audio en caché: «${texto}». Quita --solo-cache para usar kie.ai.`)
  const lock = join(CACHE, id + '.lock')
  try { await mkdir(lock) } catch { throw new Error(`La frase ${id} está bloqueada por otra ejecución. Revisa el proceso antes de quitar ${lock}.`) }
  try {
    const key = await clave()
    const registro = join(CACHE, id + '.tarea.json')
    let tarea = (await existe(registro)) ? JSON.parse(await readFile(registro, 'utf8')) : null
    for (;;) {
      if (!tarea || tarea.reintentar) {
        const intento = (tarea?.intento ?? 0) + 1
        if(process.env.STUDIO_JOB_ID)await new Budget(join(DIR,'.studio-state')).reserve('voice:'+id+':'+intento,Number(process.env.STUDIO_VOICE_RESERVE||0.25),'voz',process.env.STUDIO_JOB_ID,Number(process.env.STUDIO_JOB_BUDGET||2))
        // Se escribe antes del POST: si se pierde la respuesta, no se repite a ciegas.
        tarea = { texto, voz: v.voice_name, intento, estado: 'creando', creada: new Date().toISOString() }
        await guardar(registro, tarea)
        const d = await pedir(`${API}/createTask`, { method: 'POST', body: JSON.stringify({ model: v.model, input: {
          temperature: v.temperature ?? 0.6, sample_context: v.sample_context,
          speakers: [{ speaker_id: 'Speaker 1', voice_name: v.voice_name, ...(v.accent ? {accent:v.accent} : {}), audio_profile: v.audio_profile, style: v.style, pace: v.pace }],
          dialogue_turns: [{ speaker_id: 'Speaker 1', text: v.model==='google/gemini-3-1-flash-tts' ? texto.replace(/\bComandPOS\b/g,'Comand Pos') : texto }] } }) }, key)
        if (!d?.taskId) throw new Error('kie no devolvió taskId; revisa el proveedor antes de repetir.')
        tarea = { ...tarea, taskId: d.taskId, estado: 'pendiente' }
        await guardar(registro, tarea)
      }
      if (!tarea.taskId) throw new Error('Solicitud con resultado desconocido. Revisa kie.ai antes de crear otra tarea.')
      let url = tarea.url, repetir = false
      for (const fin = Date.now() + 300000; Date.now() < fin && !url;) {
        let d
        try { d = await pedir(`${API}/recordInfo?taskId=${encodeURIComponent(tarea.taskId)}`, {}, key) }
        catch (e) { if ([401, 403].includes(e.status) || [401, 403].includes(e.code)) throw e; await dormir(4000); continue }
        if (d.state === 'fail') {
          tarea = { ...tarea, estado: 'fallida', fallo: d.failMsg, intento: tarea.intento ?? 1 }
          await guardar(registro + `.intento-${tarea.intento}.fallida`, tarea)
          repetir = /timeout|timed out/i.test(d.failMsg || '') && tarea.intento < 3
          tarea.reintentar = repetir
          await guardar(registro, tarea)
          if (!repetir) throw new Error(`kie rechazó la voz: ${d.failMsg || 'sin detalle'}. Tarea conservada.`)
          console.log(`  Timeout terminal de kie; reintento ${tarea.intento}/2`)
          break
        }
        if (d.state === 'success') {
          url = JSON.parse(d.resultJson).resultUrls?.[0]
          if (!url) throw new Error('kie terminó sin URL de audio')
          tarea = { ...tarea, estado: 'lista', url }
          await guardar(registro, tarea)
        } else await dormir(4000)
      }
      if (repetir) continue
      if (!url) throw new Error(`La voz sigue pendiente. taskId guardado: ${tarea.taskId}; vuelve a ejecutar para consultar la misma tarea.`)
      const crudo = join(CACHE, id + '.crudo')
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
      if (!response.ok) throw new Error(`Descarga de audio: HTTP ${response.status}`)
      await writeFile(crudo, Buffer.from(await response.arrayBuffer()))
      const tempAudio = join(CACHE, id + '.tmp.wav')
      await run('ffmpeg', ['-v', 'error', '-y', '-i', crudo, '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5,aresample=48000',
        '-ac', '1', tempAudio])
      const dur = await duracion(tempAudio)
      if (!(dur > 0)) throw new Error('Audio vacío')
      await rename(tempAudio, limpio)
      return { archivo: limpio, dur, id }
    }
  } finally { await rm(lock, { recursive: true, force: true }) }
}
