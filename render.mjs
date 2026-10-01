import {sourceFingerprint,visualContext,sceneKey,checkpoint,cachedScene} from './scene-cache.mjs'
import {renameSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
// GCODE Studio: graba studio.html cuadro a cuadro con Chrome sin pantalla y lo monta con ffmpeg.
// Uso:  node render.mjs storyboards/piloto-comandas.json          → salida/<nombre>.mp4
//       node render.mjs storyboards/x.json --voz                  → con locución (kie, se cachea)
//       node render.mjs storyboards/x.json --fotos 1,5,9          → salida/foto-<t>.png (revisión rápida)
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run=promisify(execFile)
import { spawn } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { validar } from './validar.mjs'
import { subtitulos } from './subtitulos.mjs'
import { voz, perfil, duracion } from './voz.mjs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const SOURCE=process.env.STUDIO_SOURCE_DIR||DIR
const ASPECT=process.env.STUDIO_ASPECT||'vertical',PREVIEW=process.env.STUDIO_PREVIEW==='1'
const [WIDTH,HEIGHT]=({vertical:[1080,1920],horizontal:[1920,1080],square:[1080,1080],portrait:[1080,1350]})[ASPECT]
const OUT = process.env.STUDIO_OUTPUT_DIR || join(DIR, 'salida')
const FPS = PREVIEW?15:30
const PORT = 0
const CHROME = process.env.STUDIO_CHROME_PATH || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/chromium')
mkdirSync(OUT, { recursive: true })

const args = process.argv.slice(2)
const sbPath = args.find((a) => a.endsWith('.json')) || join(DIR, 'storyboards', 'piloto-comandas.json')
const sb = validar(JSON.parse(readFileSync(sbPath, 'utf8')))
const conVoz = !args.includes('--sin-voz') && (args.includes('--voz') || sb.voz === true)
const fotos = args.includes('--fotos') ? args[args.indexOf('--fotos') + 1].split(',').map(Number) : null
const musica = args.includes('--musica') ? args[args.indexOf('--musica') + 1] : 'fondo-02.mp3'

const ENTRA = 0.35, SALE = 0.5
const voces = [];const cacheStats={reused:0,rendered:0,segments:[]};await checkpoint(OUT,'preparing')
if (conVoz) {
  const v = await perfil(sb.perfil_voz || 'n8n')
  for (const [i, e] of sb.escenas.entries()) {
    await checkpoint(OUT,'voice',{scene:i+1,total:sb.escenas.length});
    if (!e.voz) { e.palabras=[]; continue }
    await new Promise((r) => setTimeout(r, 1500)) // kie limita la frecuencia
    const original=!e.voice_take&&e.audio_local?.texto===e.voz ? e.audio_local : null
    let a = original ? {archivo:join(SOURCE,original.archivo),dur:await duracion(join(SOURCE,original.archivo)),id:original.archivo} : await voz(e.voz, v, { cacheOnly: args.includes('--solo-cache'),take:e.voice_take||0 })
    const untrimmed=a;
    const trimStart=e.voz_recorte_inicio||0,trimEnd=e.voz_recorte_fin||a.dur;if(trimStart>=trimEnd||trimEnd>a.dur+.02)throw Error('Recorte de voz fuera del audio');
    if(trimStart||e.voz_recorte_fin){const clip=join(OUT,'voice-trim-'+i+'.wav');await run('ffmpeg',['-v','error','-y','-ss',String(trimStart),'-i',a.archivo,'-t',String(trimEnd-trimStart),clip]);a={...a,archivo:clip,dur:trimEnd-trimStart}}
    a.volume=e.voz_volumen??1;
    e.voz_inicio ??= ENTRA
    e.dur = Math.max(e.dur, +(e.voz_inicio + a.dur + (original ? .05 : SALE)).toFixed(2))
    e.palabras = sb.subtitulos === true && e.manual_words && e.palabras?.map(w=>w.word).join(' ')===(e.voz||'').trim().split(/\s+/).join(' ') ? e.palabras : sb.subtitulos === true ? (original ? original.palabras.filter(w=>w.start>=trimStart&&w.end<=trimEnd+.05).map(w=>({...w,start:w.start-trimStart,end:w.end-trimStart})) : (await subtitulos(e.voz,untrimmed)).filter(w=>w.start>=trimStart&&w.end<=trimEnd+.05).map(w=>({...w,start:w.start-trimStart,end:w.end-trimStart}))) : []
    copyFileSync(a.archivo,join(OUT,'voice-stem-'+i+'.wav'));voces.push({ escena: i, ...a })
    console.log(`voz ${i + 1}: ${a.dur.toFixed(2)} s  «${e.voz}»`)
  }
  let t = 0; for (const [i, e] of sb.escenas.entries()) { const x = voces.find((q) => q.escena === i); if (x) x.t = t + (e.voz_inicio ?? ENTRA); t += e.dur }
}
if(!conVoz)for(const e of sb.escenas)e.palabras=[]
// Quantize scene boundaries so cached segments and the audio clock use identical frames.
let quantizedTime=0;for(const [i,e]of sb.escenas.entries()){e.dur=Math.ceil(e.dur*FPS)/FPS;const voice=voces.find(v=>v.escena===i);if(voice)voice.t=quantizedTime+(e.voz_inicio??ENTRA);quantizedTime+=e.dur}

const perfilChrome = mkdtempSync(join(tmpdir(), 'gcode-studio-'))
const chrome = spawn(CHROME, ['--headless=new', ...(process.env.STUDIO_CHROME_NO_SANDBOX==='1'?['--no-sandbox']:[]), `--remote-debugging-port=${PORT}`, `--user-data-dir=${perfilChrome}`,
  '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1080,1920', 'about:blank'], { stdio: 'ignore' })
// Chrome se cierra siempre, aunque la corrida falle a mitad.
process.on('exit', () => { try { chrome.kill() } catch {} ; try { rmSync(perfilChrome, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }) } catch { /* Chrome may still be releasing its temporary profile. */ } })

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
async function conectar() {
  for (let i = 0; i < 50; i++) {
    try { const port = readFileSync(join(perfilChrome, 'DevToolsActivePort'), 'utf8').split('\n')[0]; const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = l.find((x) => x.type === 'page'); if (pg) return pg.webSocketDebuggerUrl } catch {}
    await esperar(200)
  }
  throw new Error('Chrome no respondió')
}
const ws = new WebSocket(await conectar())
await new Promise((r) => (ws.onopen = r))
let id = 0; const pend = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result) } }
const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })) })
const js = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value }

await cdp('Page.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: PREVIEW?(ASPECT==='portrait'?.4:.5):1, mobile: false })
await cdp('Page.navigate', { url: 'file://' + join(SOURCE, 'studio.html') })
for (let i = 0; i < 100 && !(await js('typeof window.setOutputFormat==="function" && window.studioVisualReady===true').catch(() => false)); i++) await esperar(100)
if(!(await js('window.studioVisualReady===true')))throw Error('No se cargó el módulo visual de la plantilla');
await js('Promise.all([document.fonts.load("900 40px Montserrat"),document.fonts.load("600 40px Montserrat")]).then(()=>true)')
if (!(await js('document.fonts.check("900 40px Montserrat")'))) throw new Error('Montserrat no cargó: el video saldría con otra letra')
await js(`setOutputFormat(${JSON.stringify(ASPECT)})`);await js(`preparar(${JSON.stringify(sb)})`)
const { total: TOTAL, sfx: SFX } = await js(`cargar(${JSON.stringify(sb)})`)
const quality={checked_at:new Date().toISOString(),checks:['Geometría de texto en cuadros de muestra','Duración de lectura','Audio y cuadros negros'],warnings:[],samples:[]}
let sceneStart=0;
for(const [i,e]of sb.escenas.entries()){
 for(const offset of [Math.min(1,e.dur/2),Math.max(.1,e.dur-.4)]){
  await js(`seek(${sceneStart+offset})`);
  const overflow=await js(`(()=>{const stage=document.querySelector('#stage'),box=stage.getBoundingClientRect();return [...stage.querySelectorAll('text')].filter(el=>{let p=el;while(p&&p!==stage){if(Number(getComputedStyle(p).opacity)<.1)return false;p=p.parentElement}const r=el.getBoundingClientRect();return r.width>0&&(r.left<box.left-2||r.right>box.right+2||r.top<box.top-2||r.bottom>box.bottom+2)}).map(el=>el.textContent).slice(0,8)})()`);
  quality.samples.push({scene:i+1,second:sceneStart+offset,overflow});if(overflow.length)quality.warnings.push('Escena '+(i+1)+': texto fuera del cuadro: '+overflow.join(' / '));
 }
 if(e.palabras?.length){const metrics=await js(`studioCaptionMetrics(${JSON.stringify(e.palabras)},${JSON.stringify(sb)},${e.tipo==='media'?WIDTH:1080},${e.tipo==='media'?HEIGHT:1920},${e.tipo==='media'?'undefined':66})`);if(metrics.fast||metrics.tooShort)quality.warnings.push('Escena '+(i+1)+': revisar lectura de subtítulos ('+metrics.fast+' páginas rápidas, '+metrics.tooShort+' breves)')}
 if(e.voz&&e.voz.split(/\s+/).length/e.dur>3.8)quality.warnings.push('Escena '+(i+1)+': narración rápida; revisar comprensión');
 sceneStart+=e.dur;
}
const frame = async (t) => { await js(`seek(${t})`); return Buffer.from((await cdp('Page.captureScreenshot', { format: fotos ? 'png' : 'jpeg', quality: 92 })).data, 'base64') }

if (fotos) {
  writeFileSync(join(OUT,'quality.json'),JSON.stringify({...quality,checks:['Geometría de texto en cuadros de muestra','Duración de lectura'],audio_checked:false},null,2));
  for (const t of fotos) writeFileSync(join(OUT, `foto-${t}.png`), await frame(t))
  console.log('Fotos listas en', OUT)
} else {
  const mudo = join(perfilChrome, 'video-mudo.mp4')
  const cacheDir=process.env.STUDIO_SCENE_CACHE||join(process.env.STUDIO_WORK_ROOT||DIR,'.studio-state','scene-cache');mkdirSync(cacheDir,{recursive:true});
  const source=await sourceFingerprint(SOURCE),renderer=createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex');
  const segments=[];let start=0;
  for(const [sceneIndex,scene]of sb.escenas.entries()){
    const frames=Math.round(scene.dur*FPS),key=sceneKey({scene,brand:sb.brand,evidence:sb.evidencia,source,aspect:ASPECT,fps:FPS,preview:PREVIEW,renderer,context:visualContext(sb,scene,sceneIndex,start,TOTAL)});
    let segment=await cachedScene(cacheDir,key,frames);
    await checkpoint(OUT,'rendering',{scene:sceneIndex+1,total:sb.escenas.length,cache:cacheStats});
    if(segment){cacheStats.reused++}else{
      const temp=join(cacheDir,key+'.'+process.pid+'.tmp.mp4');
      const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-threads','1','-preset',PREVIEW?'ultrafast':'veryfast','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),temp],{stdio:['pipe','inherit','inherit']});
      const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(Error('Falló la codificación de la escena')))});
      done.catch(()=>{});ff.stdin.on('error',()=>{});
      for(let f=0;f<frames;f++){if(!ff.stdin.write(await frame(start+f/FPS)))await new Promise((resolve,reject)=>{ff.stdin.once('drain',resolve);ff.stdin.once('error',reject)})}
      ff.stdin.end();await done;segment=join(cacheDir,key+'.mp4');renameSync(temp,segment);
      writeFileSync(join(cacheDir,key+'.json'),JSON.stringify({frames,at:new Date().toISOString()}));cacheStats.rendered++;
    }
    cacheStats.segments.push({key,scene_id:scene.id,start,duration:frames/FPS,frames});segments.push(segment);start+=scene.dur;console.log(Math.round(start/TOTAL*100)+'%');
  }
  const list=join(perfilChrome,'segments.txt');writeFileSync(list,segments.map(file=>"file '"+file.replaceAll("'","'\\''")+"'").join('\n'));
  await run('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',mudo],{timeout:120000});
  console.log('\rvideo mudo listo')
  await checkpoint(OUT,'mixing',{cache:cacheStats});await mezclar(mudo, TOTAL, SFX, voces);await checkpoint(OUT,'succeeded',{cache:cacheStats})
}
ws.close(); chrome.kill()

// Música a lo largo de todo el video + efectos cortos sincronizados; salida a −14 LUFS para redes.
async function mezclar(mudo, dur, sfx, voces) {
  const fuentes = {
    tap: 'sine=f=1800:d=0.04,volume=0.5',
    pop: 'sine=f=900:d=0.07,afade=t=out:st=0.02:d=0.05,volume=0.5',
    ding: 'sine=f=1320:d=0.35,afade=t=out:st=0.05:d=0.3,volume=0.45',
    stamp: 'sine=f=70:d=0.18,afade=t=out:st=0.03:d=0.15,volume=1.4',
    whoosh: 'anoisesrc=d=0.45:c=pink:a=0.35,highpass=f=600,lowpass=f=5000,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.25',
  }
  const inputs = ['-i', mudo, '-stream_loop', '-1', '-i', join(SOURCE, sb.music_file || 'assets/'+musica)]
  let graph = `[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${dur},asetpts=N/SR/TB,afade=t=in:d=0.6,afade=t=out:st=${(dur - 1.4).toFixed(2)}:d=1.4,volume=${curva(voces)}:eval=frame[m]`
  const labels = ['[m]']
  sfx.forEach(([tipo, t], i) => {
    inputs.push('-f', 'lavfi', '-i', fuentes[tipo])
    graph += `;[${i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[s${i}]`
    labels.push(`[s${i}]`)
  })
  voces.forEach((v, i) => {
    const n = 2 + sfx.length + i, ms = Math.round(v.t * 1000)
    inputs.push('-i', v.archivo)
    graph += `;[${n}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${1.15*(v.volume??1)},adelay=${ms}|${ms}[v${i}]`
    labels.push(`[v${i}]`)
  })
  graph += `;${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo[a]`
  const salida = join(OUT, sb.nombre + (voces.length ? '-voz' : '') + '.mp4')
  await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(dur), '-movflags', '+faststart', salida], { stdio: 'inherit' })
    .on('close', (c) => (c ? rej(new Error('ffmpeg falló')) : res())))
  try{const check=await run('ffmpeg',['-hide_banner','-i',salida,'-af','silencedetect=noise=-45dB:d=1','-vf','blackdetect=d=0.5:pix_th=0.10','-f','null','-'],{timeout:120000,maxBuffer:2000000});const events=check.stderr.split('\n').filter(l=>/silence_duration:|black_duration:/.test(l));quality.warnings.push(...events.map(l=>l.trim()));}catch{quality.warnings.push('No se completó el análisis de silencio y cuadros negros')}
  quality.warnings=[...new Set(quality.warnings)];quality.status=quality.warnings.length?'review':'passed';
  writeFileSync(salida.replace(/\.mp4$/, '.json'), JSON.stringify({ quality, cache:cacheStats, guion: sb, duracion: dur, fps: FPS, voz: voces.length > 0, voces: voces.map(({ escena, dur, t, id }) => ({ escena, dur, t, id })), generado: new Date().toISOString() }, null, 2))
  console.log('Listo:', salida)
}

// Volumen de la música: 0.75 sin voz, 0.22 mientras habla, con rampas de 0.3 s para que no brinque.
function curva(voces) {
  if (!voces.length) return String(sb.music_volume??.75)
  const bajo = voces.map((v) => `clip((t-${(v.t - 0.3).toFixed(2)})/0.3,0,1)*clip((${(v.t + v.dur + 0.3).toFixed(2)}-t)/0.3,0,1)`)
  const max = bajo.reduce((a, b) => `max(${a},${b})`)
  return `'${sb.music_volume??.75}-${(sb.music_volume??.75)-(sb.music_duck??.22)}*${max}'`
}
