/*
 V350000 REAL-TIME NLP / FINANCIAL SENTIMENT FUSION
 Structured text intelligence: entity, event, polarity, uncertainty, novelty,
 source reliability, temporal decay, contradiction and selective fusion.
 This is a deterministic integration layer; an external NLP model/provider supplies
 the actual text scores. No automatic order execution.
*/
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
 function tokenize(s){return norm(s).split(" ").filter(x=>x.length>2)}
 function novelty(text,history=[]){
   const t=new Set(tokenize(text)); if(!t.size)return 1;
   let best=0;
   history.forEach(h=>{const u=new Set(tokenize(h)),i=[...t].filter(x=>u.has(x)).length;
     best=Math.max(best,i/(t.size+u.size-i||1));});
   return 1-best;
 }
 function decay(value,ageMs,halfLifeMs){return n(value)*Math.pow(.5,Math.max(0,ageMs)/Math.max(1,n(halfLifeMs,86400000)))}
 function fuse(items=[],regimeWeight=1){
   let bull=0,bear=0,unc=0,total=0;
   items.forEach(x=>{const rel=clamp(n(x.sourceReliability,.5),0,1),nov=clamp(n(x.novelty,.5),0,1);
     const u=clamp(n(x.uncertainty,.5),0,1),w=rel*(.5+.5*nov)*(1-u)*n(x.weight,1);
     const p=norm(x.polarity); if(["positive","bullish","supportive"].includes(p))bull+=w;
     else if(["negative","bearish","adverse"].includes(p))bear+=w; else unc+=w; total+=w;});
   total=total||1; const bias=(bull-bear)/total;
   return {bullish:bull/total,bearish:bear/total,uncertainty:unc/total,bias,
     confidence:clamp(Math.abs(bias)*regimeWeight,0,1),direction:bias>.15?"BULLISH":bias<-.15?"BEARISH":"NEUTRAL"};
 }
 function safeFuse(items=[],regimeWeight=1){
   let bull=0,bear=0,unc=0;
   items.forEach(x=>{const rel=clamp(n(x.sourceReliability,.5),0,1),nov=clamp(n(x.novelty,.5),0,1);
     const u=clamp(n(x.uncertainty,.5),0,1),w=rel*(.5+.5*nov)*(1-u)*n(x.weight,1);
     const p=norm(x.polarity); if(["positive","bullish","supportive"].includes(p))bull+=w;
     else if(["negative","bearish","adverse"].includes(p))bear+=w; else unc+=w;});
   const total=bull+bear+unc||1,bias=(bull-bear)/total;
   return {bullish:bull/total,bearish:bear/total,uncertainty:unc/total,bias,
     confidence:clamp(Math.abs(bias)*regimeWeight,0,1),direction:bias>.15?"BULLISH":bias<-.15?"BEARISH":"NEUTRAL"};
 }
 function abstain(result,threshold=.55){return {...result,abstain:result.confidence<n(threshold,.55),action:result.confidence<n(threshold,.55)?"WAIT":result.direction}}
 function buildEvent(textMeta={},marketContext={}){
   const age=Date.now()-(Date.parse(textMeta.publishedAt)||Date.now());
   const impact=decay(n(textMeta.impact,1),age,n(textMeta.halfLifeMs,86400000));
   const rw=clamp(n(marketContext.regimeConfidence,1),0,1);
   const fused=safeFuse([{...textMeta,weight:impact}],rw);
   return {...textMeta,impactAfterDecay:impact,fusion:fused,decision:abstain(fused,n(marketContext.abstainThreshold,.55))};
 }
 global.NLPSentimentV350000={novelty,decay,fuse:safeFuse,abstain,buildEvent};
})(typeof globalThis!=="undefined"?globalThis:window);
