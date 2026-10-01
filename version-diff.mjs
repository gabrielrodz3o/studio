function stable(x){if(Array.isArray(x))return x.map(stable);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])]));return x}
export function compareVersions(current,saved){
 const result=[],a=current.escenas||current.slides||[],b=saved.escenas||saved.slides||[],key=(s,i)=>s.id||'legacy-position-'+i;
 const am=new Map(a.map((s,i)=>[key(s,i),{s,i}])),bm=new Map(b.map((s,i)=>[key(s,i),{s,i}]));
 for(const id of new Set([...am.keys(),...bm.keys()])){const x=am.get(id),y=bm.get(id);if(!x||!y){result.push({id,type:!x?'solo_guardada':'solo_actual',actual:x?.s,guardada:y?.s});continue}if(x.i!==y.i)result.push({id,type:'orden',actual:x.i+1,guardada:y.i+1});for(const field of new Set([...Object.keys(x.s),...Object.keys(y.s)]))if(field!=='id'&&JSON.stringify(stable(x.s[field]))!==JSON.stringify(stable(y.s[field])))result.push({id,field,type:'cambio',actual:x.s[field],guardada:y.s[field]})}
 for(const field of new Set([...Object.keys(current),...Object.keys(saved)]))if(!['escenas','slides'].includes(field)&&JSON.stringify(stable(current[field]))!==JSON.stringify(stable(saved[field])))result.push({id:'proyecto',field,type:'cambio',actual:current[field],guardada:saved[field]});return result;
}
