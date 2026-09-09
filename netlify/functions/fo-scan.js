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
function calc(c,v,ts){const e9=ema(c.slice(-60),9),e21=ema(c.slice(-60),21),e50=ema(c.slice(-100),50),rv=rsi(c),r1=ret(c,1),r5=ret(c,5),r20=ret(c,20),r60=ret(c,60);const vv=v.slice(-20),av=vv.length?vv.reduce((s,x)=>s+x,0)/vv.length:null,vr=finite(av)&&av>0?v.at(-1)/av:null;const tr=c.slice(-15);let atr=0;for(let i=1;i<tr.length;i++)atr+=Math.abs(tr[i]-tr[i-1]);const atrPct=tr.length>1?atr/(tr.length-1)/c.at(-1)*100:null;const macd=ema(c.slice(-80),12)-ema(c.slice(-80),26);const f={trend:e9>e21?1:e9<e21?-1:0,trend50:e21>e50?1:e21<e50?-1:0,m5:finite(r5)?clamp(r5/2,-1,1):0,m20:finite(r20)?clamp(r20/4,-1,1):0,m60:finite(r60)?clamp(r60/7,-1,1):0,rsi:finite(rv)?clamp((rv-50)/20,-1,1):0,macd:macd>0?1:-1,volume:finite(vr)?clamp((vr-1)/1.5,-1,1):0};const weights={trend:.18,trend50:.10,m5:.12,m20:.14,m60:.08,rsi:.10,macd:.10,volume:.08};const raw=Object.keys(weights).reduce((s,k)=>s+f[k]*weights[k],0),dir=raw>.12?'BULLISH':raw<-.12?'BEARISH':'NEUTRAL';const nz=Object.values(f).filter(x=>x!==0);const agreement=nz.length?Math.round(Math.max(nz.filter(x=>x>0).length,nz.filter(x=>x<0).length)/nz.length*100):0;const volState=atrPct>4?'HIGH':atrPct>2.5?'ELEVATED':'NORMAL';const regime=(e9>e21&&r20>0&&r60>0)?'TREND-UP':(e9<e21&&r20<0&&r60<0)?'TREND-DOWN':volState==='HIGH'?'HIGH-VOL':'TRANSITION';const risk=clamp(Math.round((volState==='HIGH'?35:volState==='ELEVATED'?20:5)+(100-agreement)*.35+(Math.abs(raw)<.18?15:0)),0,100);const p=clamp(50+raw*32-risk*.08+(agreement-50)*.08,5,95);const latestTs=ts.at(-1)*1000,age=Math.max(0,(Date.now()-latestTs)/60000);const health=age<=2880?100:0;const signalGate=agreement>=75&&risk<=35&&Math.abs(p-50)>=18&&volState!=='HIGH'?'PASS':'ABSTAIN';const action=signalGate==='ABSTAIN'?'WAIT':p>=68?'BUY':p<=32?'SELL':'WAIT';return {price:c.at(-1),movePct:r1,ret5:r5,ret20:r20,ret60:r60,rsi:rv,atrPct,volumeRatio:vr,probability:Math.round(p),direction:dir,agreement,risk,regime,signalGate,action,ageMinutes:Math.round(age),dataHealth:health,trend:e9>e21?1:e9<e21?-1:0,quality:health};}
async function fetchOne(symbol){const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=6mo&interval=1d&events=history`;const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (CatalystMonitor/V100000)'}});if(!r.ok)throw new Error(`Yahoo HTTP ${r.status}`);const j=await r.json(),q=j.chart?.result?.[0];if(!q)throw new Error('No chart result');const c=q.indicators?.quote?.[0]?.close||[],v=q.indicators?.quote?.[0]?.volume||[],ts=q.timestamp||[];const rows=c.map((x,i)=>({x:Number(x),v:Number(v[i]),t:Number(ts[i])})).filter(z=>finite(z.x)&&z.x>0&&finite(z.t));if(rows.length<60)throw new Error('insufficient history');return calc(rows.map(z=>z.x),rows.map(z=>finite(z.v)?z.v:0),rows.map(z=>z.t));}
exports.handler=async(event={})=>{
 const requested=String(event?.query?.market||'NSE').toUpperCase();
 const profile=MARKETS[requested]||MARKETS.NSE;
 const universe={
  ...Object.fromEntries(Object.entries(profile.indices).map(([k,v])=>[k,{symbol:v,type:'INDEX'}])),
  ...Object.fromEntries(Object.entries(profile.stocks).map(([k,v])=>[k,{symbol:v,type:'STOCK'}]))
 };
 const out={},errors=[];
 for(const [name,m] of Object.entries(universe)){
  try{out[name]={...await fetchOne(m.symbol),symbol:name,type:m.type,source:'Yahoo Finance',market:requested}}
  catch(e){out[name]={symbol:name,type:m.type,quality:0,action:'NO-TRADE',error:e.message,market:requested};errors.push(name+': '+e.message)}
 }
 const valid=Object.values(out).filter(x=>x.quality===100);
 const top=valid.filter(x=>x.signalGate==='PASS').sort((a,b)=>Math.abs(b.probability-50)-Math.abs(a.probability-50));
 return {statusCode:200,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':'*'},
  body:JSON.stringify({version:'V131000',market:requested,generatedAt:new Date().toISOString(),universe:Object.keys(universe),validCount:valid.length,total:Object.keys(universe).length,errors,topSignals:top.slice(0,12),data:out,guardrails:['public-data-only','abstention-first','risk-gate','agreement-gate','high-volatility-block','freshness-gate','no-execution']})};
};