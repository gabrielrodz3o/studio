// Casting de voces: la misma frase con varias voces para elegir de oído.
// Uso: node casting.mjs            → casting/casting.mp3 (todas seguidas) + una por voz
import { mkdir, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { voz, perfil } from './voz.mjs'
const run = promisify(execFile), DIR = dirname(fileURLToPath(import.meta.url)), OUT = join(DIR, 'casting')
const FRASE = 'Viernes en la noche, y el restaurante está full. Con ComandPOS, la orden llega clarita a la cocina.'
const VOCES = [
  ['Charon', 'voz masculina cálida y cercana'], ['Achird', 'voz masculina amigable y joven'], ['Orus', 'voz masculina firme y segura'],
  ['Puck', 'voz masculina animada y alegre'], ['Kore', 'voz femenina firme y clara'], ['Sulafat', 'voz femenina cálida y cercana'],
]
await mkdir(OUT, { recursive: true })
const base = await perfil()
const hechos = await Promise.all(VOCES.map(([n, desc], i) => new Promise((r) => setTimeout(r, i * 1600)).then(() =>
  voz(FRASE, { ...base, voice_name: n, audio_profile: `Locutor latinoamericano de comerciales, ${desc}, con un toque caribeño dominicano, sonrisa en la voz` })
    .then((v) => ({ n, ...v }), (e) => ({ n, error: e.message })))))
const lista = []
for (const [i, h] of hechos.entries()) {
  if (h.error) { console.log(`✗ ${h.n}: ${h.error}`); continue }
  const f = join(OUT, `${String(i + 1).padStart(2, '0')}-${h.n}.mp3`)
  await run('ffmpeg', ['-v', 'error', '-y', '-i', h.archivo, '-b:a', '160k', f]); lista.push(f)
  console.log(`✓ ${i + 1}. ${h.n}  ${h.dur.toFixed(1)} s`)
}
// Todas seguidas, con un segundo de silencio entre voces, en el orden de la lista.
const pausa = join(OUT, '.pausa.wav')
await run('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '1.2', pausa])
await writeFile(join(OUT, '.lista.txt'), lista.flatMap((f) => [`file '${f}'`, `file '${pausa}'`]).join('\n'))
await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(OUT, '.lista.txt'), '-ar', '48000', '-b:a', '160k', join(OUT, 'casting.mp3')])
console.log('Casting listo:', join(OUT, 'casting.mp3'))
