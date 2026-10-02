import {createHash,timingSafeEqual} from 'node:crypto'
const digest=x=>createHash('sha256').update(x).digest()
export function requiredScope(path,method){
  if(path.startsWith('/api/v1/ads')){
    if(method==='GET'||method==='HEAD')return 'ads.read'
    const action=path.split('/').at(-1);return ({connections:'ads.admin',verify:'ads.sync',sync:'ads.sync',drafts:'ads.draft',approve:'ads.approve',authorize:'ads.authorize',execute:'ads.execute',reconcile:'ads.execute',activate:'ads.activate',pause:'ads.activate'})[action]||'ads.denied'
  }
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
  if(timingSafeEqual(hashed,digest(legacyToken)))return !scope.startsWith('ads.')&&(!clients||clients.legacy_scopes?.includes(scope))
  return (clients?.clients||[]).some(c=>/^[a-f0-9]{64}$/.test(c.sha256||'')&&timingSafeEqual(hashed,Buffer.from(c.sha256,'hex'))&&c.scopes.includes(scope))
}

// Ads never inherits the legacy automation credential or unscoped read access.
export function adsPrincipal(header,clients){
 const token=String(header||'').startsWith('Bearer ')?header.slice(7):'';if(!token)return null;const h=digest(token);
 const client=(clients?.clients||[]).find(c=>/^[a-f0-9]{64}$/.test(c.sha256||'')&&timingSafeEqual(h,Buffer.from(c.sha256,'hex')));
 return client?{username:'api:'+String(client.id||'ads'),role:'integration',scopes:client.scopes,ad_connections:client.ad_connections||[],automated_ads_sync:client.automated_ads_sync===true}:null;
}
