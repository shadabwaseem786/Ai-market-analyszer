// V100000 QUANTUM F&O SCANNER — public-data decision support; no execution.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)); const finite=x=>Number.isFinite(Number(x));
const MARKETS={
 NSE:{
  indices:{NIFTY50:'^NSEI',BANKNIFTY:'^NSEBANK',FINNIFTY:'NIFTY_FIN_SERVICE.NS',MIDCPNIFTY:'NIFTY_MID_SELECT.NS',NIFTYNEXT50:'^NSMIDCP'},
  stocks:{RELIANCE:'RELIANCE.NS',HDFCBANK:'HDFCBANK.NS',ICICIBANK:'ICICIBANK.NS',SBIN:'SBIN.NS',AXISBANK:'AXISBANK.NS',KOTAKBANK:'KOTAKBANK.NS',INDUSINDBK:'INDUSINDBK.NS',BHARTIARTL:'BHARTIARTL.NS',LT:'LT.NS',TCS:'TCS.NS',INFY:'INFY.NS',HCLTECH:'HCLTECH.NS',ITC:'ITC.NS','M&M':'M&M.NS',MARUTI:'MARUTI.NS',TATAMOTORS:'TMCV.NS',TATASTEEL:'TATASTEEL.NS',ONGC:'ONGC.NS',COALINDIA:'COALINDIA.NS',BPCL:'BPCL.NS',SUNPHARMA:'SUNPHARMA.NS',ADANIPORTS:'ADANIPORTS.NS',ADANIENT:'ADANIENT.NS',POWERGRID:'POWERGRID.NS',NTPC:'NTPC.NS',BEL:'BEL.NS',HAL:'HAL.NS',TRENT:'TRENT.NS',JIOFIN:'JIOFIN.NS',TITAN:'TITAN.NS'}
 },
 NASDAQ:{
  indices:{NASDAQ:'^IXIC'},
  stocks:{AAPL:'AAPL',MSFT:'MSFT',NVDA:'NVDA',AMZN:'AMZN',META:'META',GOOGL:'GOOGL',TSLA:'TSLA',AVGO:'AVGO',AMD:'AMD',NFLX:'NFLX'}
 },
 COMMODITY:{
  indices:{GOLD:'GC=F',SILVER:'SI=F',CRUDE:'CL=F','NATURAL GAS':'NG=F'},
  stocks:{COPPER:'HG=F',PLATINUM:'PL=F',PALLADIUM:'PA=F',CORN:'ZC=F',WHEAT:'ZW=F',COFFEE:'KC=F'}
 }
};
function ema(a,p){if(!a.length)return null;const k=2/(p+1);let e=a[0];for(let i=1;i<a.length;i++)e=a[i]*k+e*(1-k);return e}
function rsi(a,p=14){if(a.length<p+1)return null;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];if(d>0)g+=d;else l-=d}return l===0?100:100-100/(1+g/l)}
function ret(a,n){return a.length>n?(a.at(-1)/a.at(-1-n)-1)*100:null}
function calc(c,v,ts){const e9=ema(c.slice(-60),9),e21=ema(c.slice(-60),21),e50=ema(c.slice(-100),50),rv=rsi(c),r1=ret(c,1),r5=ret(c,5),r20=ret(c,20),r60=ret(c,60);const vv=v.slice(-20),av=vv.length?vv.reduce((s,x)=>s+x,0)/vv.length:null,vr=finite(av)&&av>0?v.at(-1)/av:null;const tr=c.slice(-15);let atr=0;for(let i=1;i<tr.length;i++)atr+=Math.abs(tr[i]-tr[i-1]);const atrPct=tr.length>1?atr/(tr.length-1)/c.at(-1)*100:null;const macd=ema(c.slice(-80),12)-ema(c.slice(-80),26);const f={trend:e9>e21?1:e9<e21?-1:0,trend50:e21>e50?1:e21<e50?-1:0,m5:finite(r5)?clamp(r5/2,-1,1):0,m20:finite(r20)?clamp(r20/4,-1,1):0,m60:finite(r60)?clamp(r60/7,-1,1):0,rsi:finite(rv)?clamp((rv-50)/20,-1,1):0,macd:macd>0?1:-1,volume:finite(vr)?clamp((vr-1)/1.5,-1,1):0};const weights={trend:.18,trend50:.10,m5:.12,m20:.14,m60:.08,rsi:.10,macd:.10,volume:.08};const raw=Object.keys(weights).reduce((s,k)=>s+f[k]*weights[k],0),dir=raw>.12?'BULLISH':raw<-.12?'BEARISH':'NEUTRAL';const nz=Object.values(f).filter(x=>x!==0);const agreement=nz.length?Math.round(Math.max(nz.filter(x=>x>0).length,nz.filter(x=>x<0).length)/nz.length*100):0;const volState=atrPct>4?'HIGH':atrPct>2.5?'ELEVATED':'NORMAL';const regime=(e9>e21&&r20>0&&r60>0)?'TREND-UP':(e9<e21&&r20<0&&r60<0)?'TREND-DOWN':volState==='HIGH'?'HIGH-VOL':'TRANSITION';const risk=clamp(Math.round((volState==='HIGH'?35:volState==='ELEVATED'?20:5)+(100-agreement)*.35+(Math.abs(raw)<.18?15:0)),0,100);const p=clamp(50+raw*32-risk*.08+(agreement-50)*.08,5,95);const price=Number.isFinite(livePrice)?livePrice:c.at(-1),baseClose=c.at(-1),movePct=baseClose>0?(price/baseClose-1)*100:r1;const latestTs=(Number.isFinite(liveTs)?liveTs:ts.at(-1))*1000,age=Math.max(0,(Date.now()-latestTs)/60000);const health=marketOpen?(age<=30?100:0):(age<=2880?100:0);const signalGate=agreement>=75&&risk<=35&&Math.abs(p-50)>=18&&volState!=='HIGH'?'PASS':'ABSTAIN';const action=signalGate==='ABSTAIN'?'WAIT':p>=68?'BUY':p<=32?'SELL':'WAIT';return {price,movePct,ret5:r5,ret20:r20,ret60:r60,rsi:rv,atrPct,volumeRatio:vr,probability:Math.round(p),direction:dir,agreement,risk,regime,signalGate,action,ageMinutes:Math.round(age),dataHealth:health,trend:e9>e21?1:e9<e21?-1:0,quality:health,marketOpen:!!marketOpen};}
async function marketIsOpen(market){
 const now=new Date();
 const day=now.getUTCDay();
 if(day===0||day===6)return false;
 const zone=market==='NASDAQ'?'America/New_York':'Asia/Kolkata';
 const local=new Date(now.toLocaleString('en-US',{timeZone:zone}));
 const mins=local.getHours()*60+local.getMinutes();
 if(market==='NSE')return mins>=555&&mins<=930;
 if(market==='NASDAQ')return mins>=570&&mins<960;
 if(market==='COMMODITY')return mins>=540&&mins<1440;
 return false;
}
async function fetchJson(url){
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),6500);
 try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (CatalystMonitor/V131100)'},signal:ctl.signal});if(!r.ok)throw new Error('Yahoo HTTP '+r.status);return await r.json();}
 finally{clearTimeout(timer);}
}
async function fetchSeries(symbol,range,interval,host){
 const j=await fetchJson(`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&events=history`);
 const q=j.chart?.result?.[0];if(!q)throw new Error('No chart result');
 const quote=q.indicators?.quote?.[0]||{};const c=quote.close||[],v=quote.volume||[],ts=q.timestamp||[];
 const rows=c.map((x,i)=>({x:Number(x),v:Number(v[i]),t:Number(ts[i])})).filter(z=>finite(z.x)&&z.x>0&&finite(z.t));
 if(!rows.length)throw new Error('No valid price observations');
 return rows;
}
async function fetchOne(symbol,marketOpen){
 const hosts=['query1.finance.yahoo.com','query2.finance.yahoo.com'];
 let dailyRows,lastErr;
 for(const host of hosts){try{dailyRows=await fetchSeries(symbol,'6mo','1d',host);if(dailyRows.length>=60)break;}catch(e){lastErr=e;}}
 if(!dailyRows||dailyRows.length<60)throw new Error(lastErr?.message||'insufficient history');
 const closes=dailyRows.map(z=>z.x),volumes=dailyRows.map(z=>finite(z.v)?z.v:0),dailyTs=dailyRows.map(z=>z.t);
 let livePrice=null,liveTs=null,liveSource='daily-close';
 if(marketOpen){
  for(const host of hosts){
   try{
    const intraday=await fetchSeries(symbol,'1d','5m',host);
    const latest=intraday.at(-1);const age=Math.max(0,(Date.now()-latest.t*1000)/60000);
    if(Number.isFinite(age)&&age<=30){livePrice=latest.x;liveTs=latest.t;liveSource='Yahoo Finance 5m';break;}
   }catch(e){lastErr=e;}
  }
  if(livePrice===null)throw new Error('Intraday public feed unavailable/freshness exceeded 30 min');
 }
 const out=calc(closes,volumes,dailyTs,livePrice,liveTs,marketOpen);
 return {...out,priceSource:liveSource};
}
exports.handler=async(event={})=>{
 const requested=String(event?.query?.market||'NSE').toUpperCase();
 const profile=MARKETS[requested]||MARKETS.NSE;
 const marketOpen=await marketIsOpen(requested);
 const universe={
  ...Object.fromEntries(Object.entries(profile.indices).map(([k,v])=>[k,{symbol:v,type:'INDEX'}])),
  ...Object.fromEntries(Object.entries(profile.stocks).map(([k,v])=>[k,{symbol:v,type:'STOCK'}]))
 };
 const out={},errors=[];
 for(const [name,m] of Object.entries(universe)){
  try{out[name]={...await fetchOne(m.symbol,marketOpen),symbol:name,type:m.type,source:'Yahoo Finance',market:requested}}
  catch(e){out[name]={symbol:name,type:m.type,quality:0,action:'NO-TRADE',error:e.message,market:requested};errors.push(name+': '+e.message)}
 }
 const valid=Object.values(out).filter(x=>x.quality===100);
 const top=valid.filter(x=>x.signalGate==='PASS').sort((a,b)=>Math.abs(b.probability-50)-Math.abs(a.probability-50));
 return {statusCode:200,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':'*'},
  body:JSON.stringify({version:'V131100',market:requested,marketOpen,session:marketOpen?'OPEN':'CLOSED',generatedAt:new Date().toISOString(),universe:Object.keys(universe),validCount:valid.length,total:Object.keys(universe).length,errors,topSignals:top.slice(0,12),data:out,guardrails:['public-data-only','abstention-first','risk-gate','agreement-gate','high-volatility-block','freshness-gate','no-execution']})};
};