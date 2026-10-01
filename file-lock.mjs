import {spawn} from 'node:child_process'
// Kernel-owned lock: released on process death, including a killed Node parent
// (the pipe closes). Keep the inode: unlinking a flock file breaks exclusion.
export async function withFileLock(file, fn, {timeout=15000}={}) {
  const code=`import fcntl,sys,os\nf=open(sys.argv[1],'a+')\nos.chmod(sys.argv[1],0o600)\nfcntl.flock(f,fcntl.LOCK_EX)\nprint('locked',flush=True)\nsys.stdin.buffer.read()\n`;
  const child=spawn('python3',['-c',code,file],{stdio:['pipe','pipe','pipe']});
  child.stdin.on('error',()=>{});
  let timer;
  try {
    await new Promise((resolve,reject)=>{
      timer=setTimeout(()=>reject(Error('Presupuesto ocupado; vuelve a intentar')),timeout);
      child.once('error',reject);child.once('exit',()=>reject(Error('No se pudo adquirir el bloqueo de presupuesto')));
      child.stdout.once('data',()=>{clearTimeout(timer);resolve()});child.stderr.resume();
    });
    return await fn();
  } finally {clearTimeout(timer);child.stdin.destroy();child.kill();}
}
