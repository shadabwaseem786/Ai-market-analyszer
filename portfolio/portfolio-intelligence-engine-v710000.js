/* V710000 PORTFOLIO INTELLIGENCE + FILTERED MARKET VIEW */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function filterUniverse(items=[],filter="ALL"){const f=String(filter).toUpperCase();if(f==="ALL")return items;const map={INDICES:["INDEX","INDICES"],STOCKS:["STOCK","EQUITY"],"STOCK F&O":["STOCK_FNO","STOCK F&O","FNO"],"INDEX F&O":["INDEX_FNO","INDEX F&O"],OPTIONS:["OPTION","OPTIONS"],FUTURES:["FUTURE","FUTURES"],ETFS:["ETF","FUND"]};const allowed=map[f]||[f];return items.filter(x=>allowed.includes(String(x.type||"").toUpperCase()))}
 function positionSize(capital,riskPct,stopDistance){const risk=Math.max(0,n(capital)*clamp(n(riskPct,.01),0,.05));return stopDistance>0?Math.floor(risk/Math.abs(stopDistance)):0}
 function fractionalKelly(p,win,loss,fraction=.25){const q=1-p,b=n(win),l=Math.abs(n(loss));const k=l?((p*b-q*l)/(b*l)):0;return clamp(k*n(fraction,.25),0,.25)}
 function portfolioHeat(positions=[],capital=1){const risk=positions.reduce((s,p)=>s+Math.abs(n(p.maxLoss)),0);return{risk,heat:capital?risk/capital:0}}
 function concentration(positions=[]){const by={};for(const p of positions){const k=p.sector||"UNKNOWN";by[k]=(by[k]||0)+Math.abs(n(p.exposure))}const total=Object.values(by).reduce((a,b)=>a+b,0)||1;return Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{exposure:v,weight:v/total}]))}
 function scenario(positions=[],shock={price:-.03,vol:.2}){return positions.reduce((s,p)=>s+n(p.exposure)*n(shock.price)+n(p.vega)*n(shock.vol)+n(p.gamma)*Math.pow(n(shock.price),2)*.5,0)}
 function riskGate(x={},cfg={}){const heat=n(x.heat),conc=n(x.maxConcentration),stress=Math.abs(n(x.stressLoss));const pass=heat<=n(cfg.maxHeat,.03)&&conc<=n(cfg.maxConcentration,.4)&&stress<=n(cfg.maxStressLoss,.05);return{pass,action:pass?"NORMAL":"REDUCE_RISK / NO-TRADE",heat,concentration:conc,stressLoss:stress}}
 global.PortfolioV710000={filterUniverse,positionSize,fractionalKelly,portfolioHeat,concentration,scenario,riskGate};
})(typeof globalThis!=="undefined"?globalThis:window);