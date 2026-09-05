const SYMBOLS={NIFTY:["^NSEI"],BANKNIFTY:["^NSEBANK"],FINNIFTY:["NIFTY_FIN_SERVICE.NS","^CNXFINANCE"]};
function finite(v){return Number.isFinite(Number(v));}
function cleanNum(v){const n=Number(v);return finite(n)&&n>0?n:null;}
function calc(closes,ageMinutes=0){
 const ema=(a,p)=>{const k=2/(p+1);let e=a[0];for(let i=1;i<a.length;i++)e=a[i]*k+e*(1-k);return e;};
 const rsi=(a,p=14)=>{if(a.length<p+1)return null;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];if(d>0)g+=d;else l-=d;}if(l===0)return 100;return 100-100/(1+g/l);};
 const ret=n=>closes.length>n?(closes.at(-1)/closes.at(-1-n)-1)*100:null;
 const e9=ema(closes.slice(-60),9),e21=ema(closes.slice(-60),21),rv=rsi(closes);
 const trend=e9>e21?"BULL":e9<e21?"BEAR":"MIXED",r5=ret(5),r20=ret(20),r60=ret(60);
 const recent=closes.slice(-15);let tr=0;for(let i=1;i<recent.length;i++)tr+=Math.abs(recent[i]-recent[i-1]);
 const atrPct=recent.length>1?tr/(recent.length-1)/closes.at(-1)*100:null;
 const macd=ema(closes.slice(-80),12)-ema(closes.slice(-80),26);
 const factors=[["Trend",trend==="BULL"?25:trend==="BEAR"?-25:0],["5D momentum",finite(r5)?Math.max(-20,Math.min(20,r5*4)):0],["20D momentum",finite(r20)?Math.max(-12,Math.min(12,r20*2)):0],["RSI",finite(rv)?(rv>=60?15:rv>=55?8:rv<=40?-15:rv<=45?-8:0):0],["Volatility",finite(atrPct)?(atrPct<=1.5?5:atrPct<=3?0:-5):0],["MACD",macd>0?5:macd<0?-5:0]];
 const factorCount=factors.filter(f=>Number.isFinite(f[1])).length;
 const bullishFactors=factors.filter(f=>f[1]>0).length,bearishFactors=factors.filter(f=>f[1]<0).length;
 const agreementPct=factorCount?Math.round(Math.max(bullishFactors,bearishFactors)/factorCount*100):0;
 const factorConsensus=bullishFactors>bearishFactors?"BULLISH":bearishFactors>bullishFactors?"BEARISH":"MIXED";
 const rawScore=Math.max(0,Math.min(100,Math.round(50+factors.reduce((s,f)=>s+f[1],0))));
 const volatilityState=finite(atrPct)?(atrPct>4?"HIGH":atrPct>2.5?"ELEVATED":"NORMAL"):"UNKNOWN";
 const regime=(trend==="BULL"&&finite(r20)&&r20>0&&finite(r60)&&r60>0)?"BULL":
   (trend==="BEAR"&&finite(r20)&&r20<0&&finite(r60)&&r60<0)?"BEAR":
   (volatilityState==="HIGH"?"HIGH-VOL":"TRANSITION");
 const regimePenalty=regime==="HIGH-VOL"?8:regime==="TRANSITION"?4:0;
 const score=Math.max(0,Math.min(100,rawScore + (regime==="BULL"?3:regime==="BEAR"?-3:0)));
 const consensusBoost=agreementPct>=80?8:agreementPct>=60?3:0;
 const confidencePenalty=regime==="HIGH-VOL"?12:regime==="TRANSITION"?7:0;
 const riskScore=Math.max(0,Math.min(100,Math.round((volatilityState==="HIGH"?35:volatilityState==="ELEVATED"?20:5)+(regime==="TRANSITION"?20:regime==="HIGH-VOL"?30:0)+(100-agreementPct)*0.35)));
 const dataHealth=ageMinutes<=15&&factorCount>=4?100:ageMinutes<=30&&factorCount>=3?75:ageMinutes<=60&&factorCount>=3?50:0;
 const freshnessTier=ageMinutes<=15?"FRESH":ageMinutes<=30?"RECENT":ageMinutes<=60?"AGING":"STALE";
 const confidence=Math.max(0,Math.min(95,Math.round(50+Math.abs(score-50)*0.9-regimePenalty+consensusBoost-confidencePenalty-riskScore*0.12)));
 return {trend,rsi:rv,atrPct,ret5:r5,ret20:r20,ret60:r60,macd,rawScore,score,confidence,bias:score>=70?"BULLISH":score<=30?"BEARISH":"NEUTRAL",regime,volatilityState,factorCount,bullishFactors,bearishFactors,agreementPct,factorConsensus,riskScore,dataHealth,freshnessTier,rationale:factors.filter(f=>Math.abs(f[1])>=5).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,4).map(f=>f[0]+":"+(f[1]>=0?"+":"")+f[1]).join(" • ")||"Factors neutral"};
}
async function yahoo(symbol,host="query1.finance.yahoo.com"){
 const url="https://"+host+"/v8/finance/chart/"+encodeURIComponent(symbol)+"?range=6mo&interval=1d&events=history";
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),6500);let r;try{r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (CatalystMonitor/9700)"},signal:ctl.signal});}finally{clearTimeout(timer);}
 if(!r.ok)throw new Error(host+" HTTP "+r.status);
 const j=await r.json(),q=j.chart?.result?.[0];if(!q)throw new Error("No chart result");
 const raw=q.indicators?.quote?.[0]?.close||[],ts=q.timestamp||[],meta=q.meta||{};
 const currency=meta.currency||"INR",exchangeTimezone=meta.exchangeTimezoneName||"Asia/Kolkata";
 const pairs=raw.map((v,i)=>({v:cleanNum(v),t:ts[i]})).filter(x=>x.v!==null&&Number.isFinite(x.t));
 if(pairs.length<60)throw new Error("Insufficient history ("+pairs.length+" valid closes)");
 const closes=pairs.map(x=>x.v),last=pairs.at(-1),prev=pairs.at(-2);
 if(!prev||!finite(prev.v)||last.v<=0)throw new Error("Invalid latest/previous close");
 const date=new Date(last.t*1000);if(!Number.isFinite(date.getTime()))throw new Error("Missing timestamp");
 const age=Math.max(0,(Date.now()-date.getTime())/60000);if(age>2880)throw new Error("Stale market data ("+Math.round(age)+" min old)");
 const out=calc(closes,Math.round(age));if(!finite(out.score)||!finite(out.rsi)||!finite(out.atrPct))throw new Error("Invalid calculated metrics");
 const daily=closes.slice(-31).map((v,i,a)=>i?Math.abs((v/a[i-1]-1)*100):null).filter(finite);const med=daily.length?[...daily].sort((a,b)=>a-b)[Math.floor(daily.length/2)]:null;const move=(last.v-prev.v)/prev.v*100;if(!finite(move)||Math.abs(move)>15||(finite(med)&&med>0&&Math.abs(move)>Math.max(8,med*8)))throw new Error("Anomalous daily move rejected ("+move.toFixed(2)+"%; median "+(finite(med)?med.toFixed(2):"—")+"%)");
 return {symbol,price:last.v,prev:prev.v,movePct:(last.v-prev.v)/prev.v*100,...out,ts:date.toISOString(),ageMinutes:Math.round(age),source:"Yahoo Finance",provider:host,currency,exchangeTimezone,quality:100,historyCount:pairs.length};
}
async function getSymbol(candidates){
 const errors=[];
 const attempts=[];
 for(const symbol of candidates) for(const host of ["query1.finance.yahoo.com","query2.finance.yahoo.com"]) attempts.push({symbol,host});
 const results=await Promise.all(attempts.map(async a=>{
   try{return await yahoo(a.symbol,a.host);}catch(e){errors.push(a.symbol+" @ "+a.host+": "+e.message);return null;}
 }));
 const winner=results.find(Boolean);
 if(winner)return winner;
 throw new Error(errors.join(" | "));
}
exports.handler=async(event)=>{
 const data={},errors=[];
 const jobs=await Promise.all(Object.entries(SYMBOLS).map(async ([name,candidates])=>{
   try{return [name,await getSymbol(candidates),null];}
   catch(e){return [name,{symbol:candidates[0],price:null,movePct:null,score:null,confidence:null,quality:0,error:e.message,source:"Yahoo Finance"},e.message];}
 }));
 for(const [name,value,error] of jobs){data[name]=value;if(error)errors.push(name+": "+error);}
 const valid=Object.values(data).filter(x=>x.quality===100).length,now=new Date(),ist=new Date(now.toLocaleString("en-US",{timeZone:"Asia/Kolkata"})),day=ist.getDay(),mins=ist.getHours()*60+ist.getMinutes();
 const sessionOpen=day>=1&&day<=5&&mins>=555&&mins<=930;
 return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify({version:"V14000",generatedAt:now.toISOString(),validCount:valid,total:3,marketSession:sessionOpen?"OPEN":"CLOSED",data,errors,guardrails:["finite-values","history>=60","timestamp-freshness<=48h","no-zero-price","FINNIFTY-fallback","anomaly-move-gate","dual-yahoo-host-fallback","regime-classification","raw-vs-adjusted-score","factor-consensus","confidence-calibration","feed-metadata","regime-quality"]})};
};