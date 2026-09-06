const SYMBOLS={NIFTY:"^NSEI",BANKNIFTY:"^NSEBANK",FINNIFTY:"NIFTY_FIN_SERVICE.NS",NASDAQ:"^IXIC",GOLD:"GC=F",SILVER:"SI=F",CRUDE:"CL=F"};
function clean(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function symbolFor(raw){const k=String(raw||"NIFTY").toUpperCase().replace(/[^A-Z0-9]/g,"");return SYMBOLS[k]||String(raw||"^NSEI");}
function allowedSymbol(s){return Object.values(SYMBOLS).includes(s);}
async function fetchYahoo(symbol){
  const u="https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(symbol)+"?range=1d&interval=1m&events=history&includePrePost=false";
  const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0 (CatalystMonitor/RT1100)"}});
  if(!r.ok)throw new Error("Yahoo HTTP "+r.status);
  const j=await r.json(),q=j.chart?.result?.[0];if(!q)throw new Error("No chart result");
  const ts=q.timestamp||[],quote=q.indicators?.quote?.[0]||{},meta=q.meta||{};
  const candles=[];
  for(let i=0;i<ts.length;i++){const o=clean(quote.open?.[i]),h=clean(quote.high?.[i]),l=clean(quote.low?.[i]),c=clean(quote.close?.[i]),v=clean(quote.volume?.[i]);if([o,h,l,c].every(Number.isFinite))candles.push({t:ts[i]*1000,o,h,l,c,v});}
  if(!candles.length)throw new Error("No valid intraday candles");
  const last=candles[candles.length-1],ageMinutes=Math.max(0,(Date.now()-last.t)/60000);
  return {symbol,displaySymbol:meta.symbol||symbol,candles:candles.slice(-240),last:last.c,previous:candles.length>1?candles[candles.length-2].c:null,ts:new Date(last.t).toISOString(),ageMinutes:Math.round(ageMinutes),currency:meta.currency||"INR",exchangeTimezone:meta.exchangeTimezoneName||"Asia/Kolkata",status:ageMinutes<=10?"LIVE":ageMinutes<=1440?"RECENT":"STALE"};
}
exports.handler=async(event)=>{
  const raw=event?.queryStringParameters?.symbol||"NIFTY",symbol=symbolFor(raw);
  if(!allowedSymbol(symbol))return {statusCode:400,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify({error:"Unsupported symbol"})};
  try{return {statusCode:200,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify(await fetchYahoo(symbol))};}
  catch(e){return {statusCode:502,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"},body:JSON.stringify({error:e.message,symbol})};}
};
