// Original implementation inspired by caption page grouping; no external runtime.
export function captionPages(words,{measure=s=>s.length,maxWidth=40,maxLines=2,gap=.45,maxSeconds=3,minSeconds=.7,maxCps=22}={}){
 const pages=[];let lines=[],line=[],page=[];
 function finishLine(){if(line.length){lines.push(line);line=[]}}
 function finish(){finishLine();if(page.length){pages.push({start:page[0].start,end:page.at(-1).end,lines,words:page,fast:page.map(w=>w.word).join(' ').length/Math.max(.1,page.at(-1).end-page[0].start)>maxCps});lines=[];line=[];page=[]}}
 for(const w of words){if(page.length&&(w.start-page.at(-1).end>gap||w.end-page[0].start>maxSeconds||/[.!?;]$/.test(page.at(-1).word)))finish();
 if(line.length&&measure([...line,w].map(x=>x.word).join(' '))>maxWidth){finishLine();if(lines.length>=maxLines)finish()}
 line.push(w);page.push(w);
 }finish();for(const [i,p]of pages.entries()){const chars=p.words.map(w=>w.word).join(' ').length;p.displayEnd=Math.max(p.end,Math.min(pages[i+1]?.start??Infinity,p.start+maxSeconds,Math.max(p.end,p.start+minSeconds,p.start+chars/maxCps)));p.fast=chars/Math.max(.1,p.displayEnd-p.start)>maxCps;p.tooShort=p.displayEnd-p.start<minSeconds}return pages;
}
export function activeCaption(pages,time){return pages.find((p,i)=>time>=p.start-.03&&time<Math.min((p.displayEnd??p.end)+.03,pages[i+1]?.start??Infinity))}
export function captionSVG(words,time,{width=1080,y=1550,font='Montserrat',size=46,color='#fff',accent='#ff6b35',mode='active-word',measure,...options}={}){
 const page=activeCaption(captionPages(words,{...options,measure:s=>measure(s,size,font),maxWidth:width-160}),time);if(!page)return '';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let actual=size;while(actual>24&&page.lines.some(l=>measure(l.map(w=>w.word).join(' '),actual,font)>width-160))actual-=2;
 return '<g data-role="captions">'+page.lines.map((line,i)=>`<text x="${width/2}" y="${y-(page.lines.length-1-i)*actual*1.25}" text-anchor="middle" font-family="${esc(font)}" font-size="${actual}" font-weight="800" stroke="#061020" stroke-width="7" paint-order="stroke" stroke-linejoin="round">`+line.map(w=>`<tspan fill="${esc(mode==='active-word'&&time>=w.start&&time<=w.end?accent:color)}">${esc(w.word)}</tspan>`).join(' ')+'</text>').join('')+'</g>';
}
