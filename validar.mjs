export const tipos = ['media','gancho_local', 'caos_acumulado', 'transicion', 'tablet_comanda', 'pantalla_cocina', 'caja_cuadra', 'inventario_alerta', 'grafica_ventas', 'remate', 'cierre', 'comercial_doble', 'comercial_foco', 'comercial_cierre', 'comercial_n8n']
export const formatos = { historia: 'Historia ilustrada', comercial: 'Demostración comercial', consejo: 'Consejo rápido' }
export function validar(sb) {
  const errores = []
  if(sb?.brand){const b=sb.brand;if(b.logo_resource_id&&!/^[a-f0-9-]{36}$/.test(b.logo_resource_id))errores.push('Logo inválido');if(b.logo_url&&!/^assets\/resource-[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/.test(b.logo_url))errores.push('Ruta de logo inválida');if(typeof b.name!=='string'||b.name.length>100||!/^#[a-f0-9]{6}$/i.test(b.primary||'')||!/^#[a-f0-9]{6}$/i.test(b.accent||''))errores.push('Identidad visual inválida')}
  for(const k of ['music_volume','music_duck'])if(sb?.[k]!=null&&(!Number.isFinite(sb[k])||sb[k]<0||sb[k]>1))errores.push('Volumen de música inválido')
  if(sb?.cover_time!=null&&(!Number.isFinite(sb.cover_time)||sb.cover_time<0||sb.cover_time>180))errores.push('Portada inválida')
  if(sb?.music_resource_id&&!/^[a-f0-9-]{36}$/.test(sb.music_resource_id))errores.push('Música inválida')
  if(sb?.music_file&&!/^assets\/resource-[a-f0-9-]{36}\.(mp3|wav|mp4|mov)$/.test(sb.music_file))errores.push('Ruta de música inválida')
  if (!sb || typeof sb !== 'object') throw new Error('Guion inválido')
  if (sb.formato != null && !Object.hasOwn(formatos, sb.formato)) errores.push('Formato desconocido')
  if (sb.perfil_voz != null && !['n8n','original'].includes(sb.perfil_voz)) errores.push('Perfil de voz desconocido')
  if (sb.subtitulos != null && typeof sb.subtitulos !== 'boolean') errores.push('Subtítulos debe ser verdadero o falso')
  if (sb.escenas?.some?.(e => e?.tipo === 'comercial_n8n')) {
    const e=sb.evidencia
    if (!e || !/^assets\/[\w-]+\.(png|jpg|webp)$/.test(e.imagen || '') || !Number.isFinite(e.ancho) || !Number.isFinite(e.alto)) errores.push('Falta la captura original para el estilo n8n')
    else {
      for (const name of ['crop','detail']) {
        const c=e[name]
        if (!Array.isArray(c) || c.length!==4 || c.some(x=>!Number.isFinite(x)) || c[0]<0 || c[1]<0 || c[2]<=0 || c[3]<=0 || c[0]+c[2]>e.ancho || c[1]+c[3]>e.alto) errores.push('Recorte n8n inválido')
      }
      if (!Array.isArray(e.labels) || e.labels.length!==2 || e.labels.some(x=>typeof x!=='string'||x.length>40) || !Array.isArray(e.steps) || e.steps.length<3 || e.steps.some(x=>typeof x!=='string'||x.length>70) || typeof e.label!=='string' || typeof e.benefit!=='string') errores.push('Faltan las etiquetas de la captura n8n')
    }
  }
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(sb.nombre || '')) errores.push('Nombre: usa letras minúsculas, números y guiones')
  if (!Array.isArray(sb.escenas) || !sb.escenas.length || sb.escenas.length > 30) errores.push('Se requieren entre 1 y 30 escenas')
  const requeridos = { gancho_local: ['rotulo', 'sub'], caos_acumulado: ['rotulo'], transicion: ['texto'], tablet_comanda: ['rotulo', 'mesa', 'mod'], pantalla_cocina: ['rotulo', 'mesa', 'mod'], caja_cuadra: ['rotulo'], inventario_alerta: ['rotulo'], grafica_ventas: ['rotulo'], cierre: ['cta', 'whatsapp', 'web'] }
  for (const [i, e] of (Array.isArray(sb.escenas) ? sb.escenas : []).entries()) {
    const fail = s => errores.push(`Escena ${i + 1}: ${s}`)
    if (!e || typeof e !== 'object') { fail('inválida'); continue }
    if(e.tipo==='media'){
      if(typeof e.titulo!=='string'||e.titulo.length>100)fail('Título de recurso inválido')
      if(e.resource_id&&!/^[a-f0-9-]{36}$/.test(e.resource_id))fail('Recurso inválido')
      if(e.media_url&&!/^assets\/resource-[a-f0-9-]{36}\.(jpg|jpeg|png|webp|mp4|mov)$/.test(e.media_url))fail('Ruta de recurso inválida')
      if(e.media_kind&&!['image','video'].includes(e.media_kind))fail('Tipo de recurso inválido')
      if(e.fit&&!['contain','cover'].includes(e.fit))fail('Encuadre inválido')
      for(const k of ['focus_x','focus_y'])if(e[k]!=null&&(!Number.isFinite(e[k])||e[k]<0||e[k]>100))fail('Encuadre fuera de rango')
      if(e.clip_start!=null&&(!Number.isFinite(e.clip_start)||e.clip_start<0||e.clip_start>3600))fail('Inicio de clip inválido')
      if(e.shade!=null&&(!Number.isFinite(e.shade)||e.shade<0||e.shade>1))fail('Sombra inválida')
    }
    if(e.overlay){const o=e.overlay;if(typeof o.text!=='string'||o.text.length>55||!Number.isFinite(o.x)||o.x<0||o.x>1000||!Number.isFinite(o.y)||o.y<60||o.y>1850||!Number.isFinite(o.size)||o.size<20||o.size>120||!/^#[a-f0-9]{6}$/i.test(o.color||''))fail('Texto superpuesto inválido')}
    if(e.design)for(const [k,v] of Object.entries(e.design))if(!['x','y','size','dx','dy','scale'].includes(k)||!Number.isFinite(v)||Math.abs(v)>1920||(k==='scale'&&(v<.5||v>1.5)))fail('Diseño inválido')
    if (!tipos.includes(e.tipo)) fail('tipo desconocido')
    if (e.tipo==='comercial_n8n' && !['gancho','producto','detalle','cierre'].includes(e.rol)) fail('rol de escena n8n inválido')
    if (e.audio_local && (!/^assets\/[\w-]+\.wav$/.test(e.audio_local.archivo||'') || typeof e.audio_local.texto!=='string' || !Array.isArray(e.audio_local.palabras))) fail('audio local inválido')
    for(const k of ['voz_recorte_inicio','voz_recorte_fin'])if(e[k]!=null&&(!Number.isFinite(e[k])||e[k]<0||e[k]>300))fail('Recorte de voz inválido')
    if(e.voz_volumen!=null&&(!Number.isFinite(e.voz_volumen)||e.voz_volumen<0||e.voz_volumen>2))fail('Volumen inválido')
    if(e.voz_inicio != null && (!Number.isFinite(e.voz_inicio) || e.voz_inicio<0 || e.voz_inicio>2)) fail('entrada de voz inválida')
    for (const words of [e.palabras,e.audio_local?.palabras]) if (words != null) {
      if (!Array.isArray(words) || words.some((w,i)=>!w || typeof w.word!=='string' || !Number.isFinite(w.start) || !Number.isFinite(w.end) || w.start<0 || w.end<w.start || (i>0 && w.start<words[i-1].start))) fail('tiempos de subtítulos inválidos')
    }
    if (typeof e.tipo === 'string' && e.tipo.startsWith('comercial_')) {
      for (const key of ['titulo', 'etiqueta']) if (typeof e[key] !== 'string' || !e[key].trim() || e[key].length > 64) fail(`${key}: texto de hasta 64 caracteres`)
      for (const key of ['texto', 'nota']) if (e[key] != null && (typeof e[key] !== 'string' || e[key].length > 100)) fail(`${key}: texto de hasta 100 caracteres`)
      if (e.tipo === 'comercial_cierre') for (const key of ['cta', 'whatsapp', 'web']) if (typeof e[key] !== 'string' || !e[key].trim() || e[key].length > 40) fail(`falta ${key} o es demasiado largo`)
      if (e.tipo === 'comercial_doble' && (!Array.isArray(e.capturas) || e.capturas.length !== 2)) fail('se necesitan dos capturas')
      const capturas = e.tipo === 'comercial_doble' && Array.isArray(e.capturas) ? e.capturas : e.tipo === 'comercial_foco' ? [e] : []
      for (const c of capturas) {
        if (!c || !/^assets\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/.test(c.imagen || '')) { fail('captura: usa una imagen local de assets'); continue }
        if (!(c.ancho > 0 && c.alto > 0)) fail('faltan dimensiones de la captura')
        if (!Array.isArray(c.recorte) || c.recorte.length !== 4 || c.recorte.some(x => !Number.isFinite(x)) || c.recorte[0] < 0 || c.recorte[1] < 0 || c.recorte[2] <= 0 || c.recorte[3] <= 0 || c.recorte[0] + c.recorte[2] > c.ancho || c.recorte[1] + c.recorte[3] > c.alto) fail('recorte fuera de la captura')
        if (c.etiqueta != null && (typeof c.etiqueta !== 'string' || c.etiqueta.length > 64)) fail('etiqueta de captura inválida')
      }
    }
    if (!Number.isFinite(e.dur) || e.dur < 1 || e.dur > 30) fail('duración entre 1 y 30 s')
    for (const key of requeridos[e.tipo] || []) if (typeof e[key] !== 'string' || !e[key].trim()) fail(`falta ${key}`)
    for (const key of ['rotulo', 'sub', 'texto', 'cta', 'voz']) if (e[key] != null && (typeof e[key] !== 'string' || e[key].length > (key === 'voz' ? 450 : 100))) fail(`${key} demasiado largo o inválido`)
    for (const key of ['frases', 'lineas']) if (e[key] != null && (!Array.isArray(e[key]) || !e[key].length || e[key].length > 4 || e[key].some(x => typeof x !== 'string' || x.length > 55))) fail(`${key}: de 1 a 4 textos cortos`)
    if (e.tipo === 'caos_acumulado' && !e.frases?.length) fail('faltan frases')
    if (e.tipo === 'remate' && !e.lineas?.length) fail('faltan líneas')
    const key = ['tablet_comanda', 'pantalla_cocina', 'inventario_alerta'].includes(e.tipo) ? 'items' : e.tipo === 'grafica_ventas' ? 'barras' : e.tipo === 'caja_cuadra' ? 'filas' : null
    if (key) {
      const max = e.tipo === 'grafica_ventas' ? 5 : e.tipo === 'inventario_alerta' || key === 'filas' ? 4 : 3
      if (!Array.isArray(e[key]) || !e[key].length || e[key].length > max) fail(`${key}: entre 1 y ${max} filas`)
      else for (const row of e[key]) {
        if (!Array.isArray(row) || typeof row[0] !== 'string' || row[0].length > 36 || !Number.isFinite(row[1]) || row[1] < 0) fail(`${key}: fila inválida`)
        if (key === 'filas' && row[2] != null && (typeof row[2] !== 'string' || !/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(row[2]))) fail('color inválido')
        if (e.tipo === 'inventario_alerta' && (!Number.isFinite(row[2]) || row[2] < 0 || !(row[3] > 0) || row[1] > row[3] || row[2] > row[3] || typeof row[4] !== 'string')) fail('existencias inválidas')
      }
      if (e.tipo === 'grafica_ventas' && !e.barras?.some(r => r[1] > 0)) fail('al menos una venta positiva')
    }
    if (e.tipo === 'inventario_alerta' && (!Number.isInteger(e.alerta) || e.alerta < 0 || e.alerta >= (e.items?.length || 0))) fail('índice de alerta inválido')
  }
  if (errores.length) throw new Error(errores.join('\n'))
  return sb
}
