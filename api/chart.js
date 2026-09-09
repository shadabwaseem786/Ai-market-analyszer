// AI Market Analyzer — public chart adapter.
// Server-side Yahoo chart retrieval; read-only, no execution.
const MAP={
  NIFTY:['^NSEI'],
  BANKNIFTY:['^NSEBANK'],
  FINNIFTY:['NIFTY_FIN_SERVICE.NS','^CNXFINANCE'],
  SENSEX:['^BSESN'],
  NASDAQ:['^IXIC'],
  GOLD:['GC=F'],
  SILVER:['SI=F'],
  CRUDE:['CL=F'],
  'NATURAL GAS':['NG=F']
};
async function fetchChart(symbol,host){
  const url='https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=6mo&interval=1d&events=history';
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (CatalystMonitor/9700)'}});
  if(!r.ok) throw new Error(host+' HTTP '+r.status);
  const j=await r.json(),q=j.chart?.result?.[0];
  if(!q) throw new Error('No chart result');
  const closes=(q.indicators?.quote?.[0]?.close||[]).map(Number).filter(v=>Number.isFinite(v)&&v>0);
  if(closes.length<10) throw new Error('Insufficient chart history');
  return {closes,source:'Yahoo Finance',generatedAt:new Date().toISOString(),symbol};
}
module.exports=async function handler(req,res){
  try{
    const key=String((req.query||{}).symbol||'NIFTY').toUpperCase();
    const candidates=MAP[key]||[key];
    let last;
    for(const symbol of candidates){
      for(const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com']){
        try{
          const out=await fetchChart(symbol,host);
          return res.status(200).setHeader('content-type','application/json').setHeader('cache-control','no-store').send(JSON.stringify(out));
        }catch(e){last=e;}
      }
    }
    return res.status(502).setHeader('content-type','application/json').send(JSON.stringify({error:last?.message||'Chart provider unavailable'}));
  }catch(e){
    return res.status(500).setHeader('content-type','application/json').send(JSON.stringify({error:e.message}));
  }
};
