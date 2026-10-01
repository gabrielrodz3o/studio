import {createHash,randomUUID} from 'node:crypto'
import {readFile,readdir,mkdir,rename,writeFile,stat} from 'node:fs/promises'
import {join} from 'node:path'
import {canonical} from './releases.mjs'

export async function sourceFingerprint(root) {
  const entries=[]
  async function scan(dir,prefix=''){
    for(const file of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
      const name=prefix+file.name;if(file.isDirectory()){if(name==='assets')await scan(join(dir,file.name),name+'/');continue}
      if(!prefix&&!['studio.html','n8n-style.js','media-scenes.js','formats.js'].includes(name))continue
      if(prefix&&(file.name.startsWith('resource-')||/\.(wav|mp3)$/.test(name)))continue
      entries.push([name,createHash('sha256').update(await readFile(join(dir,file.name))).digest('hex')])
    }
  }
  await scan(root);return createHash('sha256').update(canonical(entries)).digest('hex')
}
export function sceneKey({scene,brand,evidence,source,aspect,fps,preview,renderer,context}){
  const {id,...content}=scene
  return createHash('sha256').update(canonical({schema:1,scene:content,brand,evidence,source,aspect,fps,preview,renderer,context})).digest('hex')
}
export async function checkpoint(out,stage,detail={}) {
  await mkdir(out,{recursive:true});const file=join(out,'checkpoint.json'),temp=file+'.'+randomUUID()+'.tmp'
  await writeFile(temp,JSON.stringify({stage,at:new Date().toISOString(),...detail}),{mode:0o600});await rename(temp,file)
}
export async function cachedScene(dir,key,frames){
  try{const meta=JSON.parse(await readFile(join(dir,key+'.json'),'utf8'));const file=join(dir,key+'.mp4');if(meta.frames!==frames||!(await stat(file)).size)return null;return file}catch(e){if(e.code!=='ENOENT')throw e;return null}
}
