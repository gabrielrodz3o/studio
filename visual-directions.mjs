// Stable IDs: stored on each generation; changing a campaign never restyles old jobs.
export const visualDirections=[
 {id:'cinematografica',name:'Fotografía cinematográfica',dark:true,prompt:'Immersive cinematic commercial photography, warm practical lighting, navy shadows, authentic Latin American people and tactile materials, dramatic depth, asymmetric magazine composition. No generic white bands.'},
 {id:'papel-editorial',name:'Papel recortado',dark:false,prompt:'Sophisticated editorial cut-paper collage, torn ivory paper, layered navy and brand accent paper, tactile shadows, carefully cut photographic subjects. Visibly physical paper construction, never a plain stock photo.'},
 {id:'tecnologica',name:'Tecnología y producto',dark:true,prompt:'Premium product-led technology campaign, sculptural navy environment, restrained accent light, beautiful tangible devices and architectural depth. Do not invent software interfaces; screens face away or are blank.'},
 {id:'restaurante-3d',name:'Mundo de marca en 3D',dark:false,prompt:'Clearly stylized isometric miniature diorama, clay-like 3D people, crafted architectural model, tactile materials and ambient shadows. Adapt the business setting to this brand and topic; not always a restaurant. Must look like a miniature 3D illustration, NOT photography.'},
 {id:'editorial-impacto',name:'Editorial de alto impacto',dark:false,prompt:'Contemporary bold editorial campaign, asymmetric navy, ivory and brand accent blocks, cutout photographic subjects crossing geometric layers, strong contrast and magazine-cover craftsmanship.'}
];
export const visualDirection=id=>{const d=visualDirections.find(d=>d.id===id);if(!d)throw Error('Dirección visual no disponible');return d};
