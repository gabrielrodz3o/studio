import {fail,requireValue} from './contracts.mjs'
export async function adsRoute(store,{path,method,input,actor}){
 if(method==='GET'&&path==='')return store.snapshot(actor);
 requireValue(method==='POST','Método o ruta Ads no admitidos',405);
 switch(path){
 case '/connections':return store.saveConnection(input,actor);
 case '/verify':return store.verify(input.connection_id,actor);
 case '/sync':return store.sync(input,actor);
 case '/drafts':return store.saveDraft(input,actor);
 case '/approve':return store.approve(input,actor);
 case '/authorize':return store.authorize(input,actor);
 case '/execute':return store.execute(input,actor);
 case '/reconcile':return store.reconcile(input,actor);
 case '/activate':return store.activate(input,actor);
 case '/pause':return store.pause(input,actor);
 default:throw fail(404,'Ruta Ads no encontrada');
 }
}
