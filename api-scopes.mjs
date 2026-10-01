import {createHash,timingSafeEqual} from 'node:crypto'
const digest=x=>createHash('sha256').update(x).digest()
export function requiredScope(path,method){
  if(method==='GET'||method==='HEAD')return 'read'
  if(path.startsWith('/api/v1/automation/'))return 'automation'
  if(path==='/api/v1/publications/import')return 'import'
  if(path==='/api/v1/metrics')return 'metrics'
  if(path.startsWith('/api/v1/deliveries/'))return 'publish'
  return 'produce'
}
export function authorizeApi(header,path,method,legacyToken,clients){
  const token=String(header||'').startsWith('Bearer ')?header.slice(7):'',hashed=digest(token)
  if(!token)return false
  const scope=requiredScope(path,method)
  if(timingSafeEqual(hashed,digest(legacyToken)))return !clients||clients.legacy_scopes?.includes(scope)
  return (clients?.clients||[]).some(c=>/^[a-f0-9]{64}$/.test(c.sha256||'')&&timingSafeEqual(hashed,Buffer.from(c.sha256,'hex'))&&c.scopes.includes(scope))
}
