/* V850000 INSTITUTIONAL + SMART-MONEY FLOW INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function fiiDii(fii,dii){return{fii:n(fii),dii:n(dii),net:n(fii)+n(dii),leader:Math.abs(n(fii))>Math.abs(n(dii))?"FII":Math.abs(n(dii))>Math.abs(n(fii))?"DII":"BALANCED"}}
 function delivery(deliveryPct,avgPct){const p=n(deliveryPct),a=Math.max(1e-9,n(avgPct,1));return{pct:p,ratio:p/a,state:p>a*1.25?"HIGH-DELIVERY":p<a*.75?"LOW-DELIVERY":"NORMAL"}}
 function blockBulk(value,avgValue){const v=n(value),a=Math.max(1,n(avgValue));return{value:v,relative:v/a,flag:v>a*2}}
 function flowPrice(flow,returnPct){const f=n(flow),r=n(returnPct);return{flow:f,returnPct:r,alignment:(f>0&&r>0)||(f<0&&r<0)?"CONFIRMING":(f>0&&r<0)||(f<0&&r>0)?"DIVERGING":"NEUTRAL"}}
 function accumulation(x={}){const score=clamp(.3*n(x.delivery,.5)+.3*n(x.flow,.5)+.2*n(x.volume,.5)+.2*n(x.priceStrength,.5),0,1);return{score,state:score>.7?"ACCUMULATION":score<.3?"DISTRIBUTION":"NEUTRAL"}}
 function sectorRotation(sectors=[]){return sectors.map(s=>({...s,score:clamp(.35*n(s.relativeStrength,.5)+.35*n(s.flow,.5)+.3*n(s.momentum,.5),0,1)})).sort((a,b)=>b.score-a.score)}
 function relativeStrength(stock,index){const s=n(stock),i=n(index);return{s,i,excessReturn:s-i,state:s>i?"OUTPERFORM":"UNDERPERFORM"}}
 function footprint(x={}){const score=clamp(.25*n(x.flow,.5)+.2*n(x.delivery,.5)+.2*n(x.block,.5)+.2*n(x.accumulation,.5)+.15*n(x.persistence,.5),0,1);return{score,label:score>.7?"INSTITUTIONAL-BUY":score<.3?"INSTITUTIONAL-SELL":"MIXED"}}
 function persistence(history=[]){if(history.length<2)return{score:.5};let pos=0;for(let i=1;i<history.length;i++)if(Math.sign(n(history[i]))===Math.sign(n(history[i-1])))pos++;return{score:pos/Math.max(1,history.length-1),direction:mean(history)>0?"INFLOW":"OUTFLOW"}}
 function divergence(x={}){const f=n(x.flow),p=n(x.price);const d=(f>0&&p<0)||(f<0&&p>0);return{flag:d,score:d?Math.min(1,Math.abs(f-p)):0}}
 function indexStock(indexFlow,stockFlow){return{index:n(indexFlow),stock:n(stockFlow),alignment:Math.sign(n(indexFlow))===Math.sign(n(stockFlow))?"ALIGNED":"DIVERGENT"}}
 function fuse(x={}){const vals=[n(x.fiiDii,.5),n(x.delivery,.5),n(x.flowPrice,.5),n(x.accumulation,.5),n(x.sector,.5),n(x.footprint,.5),n(x.persistence,.5)];const s=mean(vals);return{score:clamp(s,0,1),direction:s>.6?"BULLISH":s<.4?"BEARISH":"NEUTRAL",confidence:Math.abs(s-.5)*2}}
 global.SmartMoneyV850000={fiiDii,delivery,blockBulk,flowPrice,accumulation,sectorRotation,relativeStrength,footprint,persistence,divergence,indexStock,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);