import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import {readFile,writeFile,rename,stat,mkdir,copyFile} from 'node:fs/promises';import {createReadStream} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';import {join,dirname} from 'node:path';import {homedir} from 'node:os';import {fileURLToPath} from 'node:url';
import {withFileLock} from './file-lock.mjs';
const run=promisify(execFile),DIR=dirname(fileURLToPath(import.meta.url)),identities=new Map();
async function identity(file){const s=await stat(file),key=file+':'+s.size+':'+s.mtimeMs;if(!identities.has(key)){const h=createHash('sha256');for await(const chunk of createReadStream(file))h.update(chunk);identities.set(key,h.digest('hex'))}return identities.get(key)}
export function alignmentKey(audioHash,text,identity){return createHash('sha256').update(JSON.stringify({schema:3,audioHash,text,...identity})).digest('hex').slice(0,24)}
export function validWords(words,duration){return Array.isArray(words)&&words.length>0&&words.every((w,i)=>typeof w.word==='string'&&w.word.trim()&&Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.start>=0&&w.end>=w.start&&w.end<=duration+.15&&(!i||w.start>=words[i-1].start))}
export async function subtitulos(texto,audio){
 const model=process.env.WHISPER_MODEL||join(homedir(),'.cache/whisper/ggml-small.bin');
 const binary=(await run('which',['whisper-cli'])).stdout.trim();
 const runtime={model:await identity(model),binary:await identity(binary),aligner:await identity(join(DIR,'alinear.py')),pipeline:await identity(fileURLToPath(import.meta.url)),ffmpeg:(await run('ffmpeg',['-version'])).stdout.split('\n')[0],preprocess:'pcm_s16le:16000:mono',language:'es'};
 const bytes=await readFile(audio.archivo),id=alignmentKey(createHash('sha256').update(bytes).digest('hex'),texto,runtime),folder=join(process.env.STUDIO_WORK_ROOT||DIR,'voz');await mkdir(folder,{recursive:true});
 const base=join(folder,'sub-'+id),cache=base+'.words.json';
 return withFileLock(base+'.lock',async()=>{
  try{const old=JSON.parse(await readFile(cache,'utf8'));if(old.key===id&&validWords(old.words,audio.dur))return old.words}catch(e){if(e.code!=='ENOENT'&&!(e instanceof SyntaxError))throw e}
  const scratch=base+'.'+randomUUID();let review;try{review=JSON.parse(await readFile(base+'.review.json','utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
  const accepted=review?.acceptance?.key===id&&review.audio_hash===createHash('sha256').update(bytes).digest('hex')&&review.acceptance.audio_hash===review.audio_hash;

  try{
   await run('ffmpeg',['-v','error','-y','-i',audio.archivo,'-ar','16000','-ac','1',scratch+'.wav']);
   await run(binary,['-m',model,'-f',scratch+'.wav','-l','es','-np','-ng','-ml','1','-sow','-oj','-of',scratch],{maxBuffer:4*1024*1024,timeout:180000});
   await writeFile(scratch+'.input.json',JSON.stringify({texto,duracion:audio.dur,review_accepted:accepted}));
   const result=JSON.parse((await run('python3',[join(DIR,'alinear.py'),scratch+'.input.json',scratch+'.json'])).stdout);
   if(!validWords(result.words,audio.dur))throw Error('Alineación inválida; revisa audio y texto');
   await writeFile(scratch+'.cache',JSON.stringify({...result,key:id,runtime}));await rename(scratch+'.cache',cache);return result.words;
  }catch(error){let transcription;try{transcription=JSON.parse(await readFile(scratch+'.json','utf8'))}catch{}if(transcription?.transcription){await copyFile(audio.archivo,base+'.review.wav');const packet={key:id,text:texto,duration:audio.dur,audio_hash:createHash('sha256').update(bytes).digest('hex'),runtime,transcription:transcription.transcription,error:String(error.stderr||error.message).slice(-1800),at:new Date().toISOString(),job_id:process.env.STUDIO_JOB_ID||null,acceptance:accepted?review.acceptance:null};const temp=base+'.review.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(packet),{mode:0o600});await rename(temp,base+'.review.json');throw Error('Revisión de voz pendiente ('+id+'). Escucha la frase en Marketing → Operación y costes.')}throw error;
  }finally{const {unlink}=await import('node:fs/promises');for(const ext of ['.wav','.input.json','.json','.cache'])await unlink(scratch+ext).catch(()=>{})}
 },{timeout:240000});
}
