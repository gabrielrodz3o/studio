import {mkdir,readFile,readdir,writeFile,rename} from 'node:fs/promises'
import {join} from 'node:path'
import {randomUUID} from 'node:crypto'
export class Versions{
 constructor(root){this.root=root;this.queue=Promise.resolve()}
 dir(kind,name){if(!['video','imagen','carrusel','historia_social'].includes(kind)||!/^[a-z0-9][a-z0-9-]{0,79}$/.test(name))throw Error('Proyecto inválido');return join(this.root,'.studio-state','versions',kind,name)}
 async list(kind,name){const dir=this.dir(kind,name);return (await readdir(dir).catch(e=>{if(e.code==='ENOENT')return [];throw e})).filter(f=>f.endsWith('.json')).sort().reverse().map(f=>({id:f.slice(0,-5)}))}
 async get(kind,name,id){if(!/^[0-9a-f-]+$/.test(id))throw Error('Versión inválida');return JSON.parse(await readFile(join(this.dir(kind,name),id+'.json'),'utf8'))}
 save(kind,script,actor){const next=this.queue.then(async()=>{const dir=this.dir(kind,script.nombre);await mkdir(dir,{recursive:true});const version=Date.now()+'-'+randomUUID();const file=join(this.root,kind==='video'?'storyboards':'feed/templates',script.nombre+'.json');let old;try{old=JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}if(old&&(old.brand_id||'comandpos')!==(script.brand_id||'comandpos'))throw Error('Este nombre de proyecto pertenece a otra marca; utiliza otro nombre');if(old&&!(await this.list(kind,script.nombre)).length)await writeFile(join(dir,(Date.now()-1)+'-'+randomUUID()+'.json'),JSON.stringify({actor:'importado',script:old}));await writeFile(join(dir,version+'.json'),JSON.stringify({actor,at:new Date().toISOString(),script}));const tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(script,null,2)+'\n');await rename(tmp,file);return {version}});this.queue=next.catch(()=>{});return next}
}
