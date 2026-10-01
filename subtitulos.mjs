import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {readFile,writeFile,access,rename} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {join,dirname} from 'node:path'
import {homedir} from 'node:os'
import {fileURLToPath} from 'node:url'
const run=promisify(execFile),DIR=dirname(fileURLToPath(import.meta.url))
export async function subtitulos(texto,audio){
 const bytes=await readFile(audio.archivo)
 const id=createHash('sha256').update(bytes).update(texto).digest('hex').slice(0,20)
 const base=join(DIR,'voz','sub-'+id),cache=base+'.words.json'
 try{return JSON.parse(await readFile(cache,'utf8')).words}catch(e){if(e.code!=='ENOENT')throw e}
 const model=process.env.WHISPER_MODEL||join(homedir(),'.cache/whisper/ggml-small.bin')
 await access(model).catch(()=>{throw Error('Falta el modelo local de transcripción. Configura WHISPER_MODEL.')})
 await run('ffmpeg',['-v','error','-y','-i',audio.archivo,'-ar','16000','-ac','1',base+'.wav'])
 await run('whisper-cli',['-m',model,'-f',base+'.wav','-l','es','-np','-ng','-ml','1','-sow','-oj','-of',base],{maxBuffer:4*1024*1024,timeout:180000})
 await writeFile(base+'.input.json',JSON.stringify({texto,duracion:audio.dur}))
 const {stdout}=await run('python3',[join(DIR,'alinear.py'),base+'.input.json',base+'.json'])
 const result=JSON.parse(stdout)
 await writeFile(cache+'.tmp',JSON.stringify(result,null,2));await rename(cache+'.tmp',cache)
 return result.words
}
