// V100000 QUANTUM ORCHESTRATOR — decision-support layer; no execution.
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:50;
function score(obs){
  const trend=clamp(50+(obs.trend===1?22:obs.trend===-1?-22:0));
  const momentum=clamp(50+(obs.ret5||0)*2+(obs.ret20||0)*1.2);
  const volume=clamp(50+((obs.volumeRatio||1)-1)*28);
  const rsi=obs.rsi==null?50:clamp(50+(obs.rsi-50)*1.3);
  const volPenalty=obs.atrPct>4?22:obs.atrPct>2.5?10:0;
  const agents={technical:trend,momentum,flow:volume,meanReversion:100-rsi,regime:obs.regime==='TREND-UP'?72:obs.regime==='TREND-DOWN'?28:50,risk:clamp(100-(obs.risk||50))};
  const bullish=[agents.technical,agents.momentum,agents.flow,agents.regime,agents.risk].filter(x=>x>=55).length;
  const bearish=[agents.technical,agents.momentum,agents.flow,agents.regime,agents.risk].filter(x=>x<=45).length;
  const raw=mean(Object.values(agents))-volPenalty;
  const edge=clamp(Math.round(raw));
  const agreement=clamp(Math.round(Math.max(bullish,bearish)/5*100));
  const uncertainty=clamp(Math.round(100-agreement+(volPenalty*1.5)));
  const integrity=clamp(Math.round(0.35*(obs.dataHealth||0)+0.25*agreement+0.25*(100-(obs.risk||50))+0.15*(100-uncertainty)));
  const gate=integrity>=78 && agreement>=75 && (obs.risk||100)<=40 && uncertainty<=35 && obs.regime!=='HIGH-VOL' ? 'PASS':'ABSTAIN';
  const action=gate==='PASS'?(edge>=63?'BUY':edge<=37?'SELL':'WAIT'):'WAIT';
  return {edge,agreement,uncertainty,integrity,gate,action,agents};
}
if(typeof module!=='undefined'&&module.exports) module.exports={score};
if(typeof window!=='undefined') window.Quantum100={score};
