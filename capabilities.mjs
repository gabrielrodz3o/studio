// Transport support is not proof of live authorization. Browser sessions are not API connections.
export function normalizeMusicMode(value='none') {
  if (!['none','recommended'].includes(value)) throw Object.assign(Error('Opción de música inválida'),{status:422})
  return value
}
export function photoMusicCapability({channel,kind,music_mode='none'}) {
  normalizeMusicMode(music_mode)
  const eligible=['imagen','carrusel'].includes(kind)&&['instagram','tiktok'].includes(channel)
  const reason=channel==='tiktok'
    ? 'TikTok permite música recomendada para fotos, pero el conector Buffer actual no expone auto_add_music. Falta un proveedor API compatible y autorizado.'
    : channel==='instagram'
      ? 'Música para imágenes de Instagram no verificada en la API del conector actual. La sesión del navegador no habilita esta función.'
      : 'Música nativa para este formato o plataforma no implementada.'
  return {requested:music_mode==='recommended',eligible,supported:false,status:eligible?(channel==='tiktok'?'pending_api_connection':'unsupported_api'):'unsupported_format',reason,checked_at:'2026-10-03',selection:'platform_recommended',preserve_photo:true}
}
export function capability(piece,accounts=[]) {
  const {brand_id,channel,kind}=piece
  const account=accounts.find(a=>a.channel===channel&&(!piece.account_key||a.key===piece.account_key)),reasons=[]
  if(!['comandpos','gcode'].includes(brand_id))reasons.push('Cuenta automática no configurada para esta marca')
  if(channel==='youtube'||!account)reasons.push('Solo registro manual: falta un conector')
  if(channel==='tiktok'&&kind==='historia_social')reasons.push('El conector actual no publica historias de TikTok')
  const music=photoMusicCapability(piece)
  if(music.requested&&!music.supported)reasons.push(music.reason)
  return {mode:reasons.length?(music.requested?'blocked_music':'registro_manual'):'publicacion_api',supported:!reasons.length,account:account?.label||null,permission_status:'requiere_verificacion_en_proveedor',checked_at:account?.capabilities_checked_at||null,music,reasons}
}
export function requireCapability(piece,accounts){const c=capability(piece,accounts);if(!c.supported)throw Object.assign(Error(c.reasons.join('. ')),{status:422});return c}
