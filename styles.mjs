export const styles = {
 historia:{name:'Historia ilustrada',description:'Un personaje, un problema y una solución visible.'},
 comercial:{name:'Demostración comercial',description:'El estilo n8n: capturas reales, voz y palabras resaltadas.'},
 consejo:{name:'Consejo rápido',description:'Una idea práctica explicada en pocos segundos.'},
 tutorial:{name:'Paso a paso',description:'Una acción por escena, con numeración y avance.',layout:'steps',beats:['Lo que vas a aprender','Primer paso','Segundo paso','Tercer paso','Próximo paso']},
 pregunta:{name:'Pregunta y respuesta',description:'Una duda concreta y una respuesta clara.',layout:'question',beats:['La pregunta','La respuesta','Cómo funciona','Conoce más']},
 lista:{name:'Lista útil',description:'Tres puntos fáciles de recordar, en tarjetas.',layout:'cards',beats:['Tres puntos para recordar','Punto uno','Punto dos','Punto tres','Conoce más']},
 solucion:{name:'Problema y solución',description:'Una dificultad cotidiana y una forma de abordarla.',layout:'split',beats:['Una dificultad cotidiana','Qué necesitas resolver','Cómo puede ayudar','Próximo paso']},
 comparativa:{name:'Comparativa educativa',description:'Explica dos conceptos sin inventar ventajas ni resultados.',layout:'split',beats:['Dos conceptos que conviene distinguir','El primer concepto','El segundo concepto','Qué debes recordar','Conoce más']},
 marca:{name:'Presentación de marca',description:'Tipografía protagonista, servicios y un cierre directo.',layout:'minimal',beats:['Conoce la marca','Qué hacemos','Para quién trabajamos','Conversemos']}
}
export function styleTemplate(style,brand={}){
 const preset=styles[style];if(!preset?.beats)throw Error('Este estilo utiliza su plantilla original')
 return {nombre:'base-'+style,formato:style,voz:true,subtitulos:true,perfil_voz:'n8n',escenas:preset.beats.map((title,i)=>({tipo:'media',layout:preset.layout,step:i+1,steps:preset.beats.length,dur:5,titulo:i===preset.beats.length-1?(brand.cta||'Solicita tu demo'):title,texto:i===preset.beats.length-1?(brand.contact||'+1 849 540 6093'):'Edita este mensaje con un hecho comprobado.',voz:'',cta:brand.cta||'Solicita tu demo'}))}
}
export function automaticBrief(brand,history=[]){
 const facts=String(brand?.facts||'Registro de pedidos y modificadores\nEnvío de comandas a cocina\nGestión de mesas y cuentas\nConsulta de reportes del negocio').split(/\n|;|(?<=\.)\s+/).map(x=>x.trim()).filter(x=>x.length>8)
 if(!facts.length)throw Error('Completa los hechos comprobados de la marca antes de crear automáticamente')
 const recent=history.filter(x=>x.brand_id===(brand?.id||'comandpos')).sort((a,b)=>String(b.at).localeCompare(String(a.at)))
 const used=recent.slice(0,Math.max(0,facts.length-1)).map(x=>x.topic)
 const topic=facts.find(x=>!used.includes(x))||facts[recent.length%facts.length]
 const rotation=['tutorial','pregunta','lista','solucion','marca','comparativa']
 const style=rotation[recent.length%rotation.length]
 return {topic,style,idea:`Crea una pieza educativa para ${brand?.audience||'negocios de República Dominicana'} sobre este hecho de la ficha de marca (requiere revisión de evidencia): ${topic}. Elige una situación cotidiana ilustrativa y explica únicamente lo que este hecho permite afirmar. No inventes pasos de interfaz, testimonios, cifras ni resultados. Cierra con ${brand?.cta||'Solicita tu demo'}.`}
}
