// Review authority comes from the saved brand, never from an editable storyboard.
export function freezeEvidence(script,brand){
 return (script.evidence_claims||[]).map(c=>{
  const trusted=brand?.claims?.find(x=>x.id===c.id&&x.text===c.text&&x.source===c.source&&x.verified&&x.reviewed_by);
  return {id:String(c.id||''),text:String(c.text||''),source:String(c.source||''),verified:!!trusted,status:trusted?'reviewed':'declared',reviewed_by:trusted?.reviewed_by||null,reviewed_at:trusted?.reviewed_at||null};
 });
}
