/*
 V220000 ADVERSARIAL MARKET WAR ROOM
 Bull-vs-Bear-vs-Risk evidence contest.
 Research/inference only; no order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function sideScore(evidence, side){
    const list=(evidence||[]).filter(x=>String(x.side||"").toUpperCase()===side);
    if(!list.length)return {score:50,count:0};
    let w=0,s=0;
    for(const x of list){
      const q=clamp(n(x.quality,50),0,100);
      const rel=clamp(n(x.reliability,50),0,100);
      const weight=Math.max(.1,(q+rel)/200);
      s+=clamp(n(x.strength,50),0,100)*weight; w+=weight;
    }
    return {score:w?s/w:50,count:list.length};
  }

  function correlationPenalty(evidence){
    const groups={};
    for(const x of evidence||[]){
      const g=x.group||x.source||"unknown";
      groups[g]=(groups[g]||0)+1;
    }
    const counts=Object.values(groups);
    if(!counts.length)return 0;
    const dominant=Math.max(...counts);
    return clamp((dominant/counts.reduce((a,b)=>a+b,0))*30,0,30);
  }

  function warRoom(input={}){
    const evidence=input.evidence||[];
    const bull=sideScore(evidence,"BULL");
    const bear=sideScore(evidence,"BEAR");
    const risk=sideScore(evidence,"RISK");
    const corr=correlationPenalty(evidence);
    const dataQuality=clamp(n(input.dataQuality,100),0,100);
    const regimeFit=clamp(n(input.regimeFit,50),0,100);

    const bullNet=clamp(bull.score-corr,0,100);
    const bearNet=clamp(bear.score-corr,0,100);
    const riskNet=clamp(risk.score,0,100);

    let verdict="WAIT";
    const edge=bullNet-bearNet;

    if(dataQuality<60 || riskNet>=75) verdict="NO-TRADE";
    else if(edge>=18 && bullNet>=62 && regimeFit>=50) verdict="BUY";
    else if(edge<=-18 && bearNet>=62 && regimeFit>=50) verdict="SELL";

    const confidence=clamp(
      50 + Math.abs(edge)*0.9 - corr*0.4 + (dataQuality-50)*0.15 - Math.max(0,riskNet-50)*0.25,
      0,100
    );

    return {
      verdict,
      confidence,
      bull:{...bull,netScore:bullNet},
      bear:{...bear,netScore:bearNet},
      risk:{...risk,netScore:riskNet},
      correlationPenalty:corr,
      dataQuality,
      regimeFit,
      dominantSide:edge>0?"BULL":edge<0?"BEAR":"TIE",
      dissent:Math.abs(edge)<12
    };
  }

  global.WarRoomV220000={sideScore,correlationPenalty,warRoom};
})(typeof globalThis!=="undefined"?globalThis:window);
