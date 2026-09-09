/*
 V280000 AI SWARM / ENSEMBLE INTELLIGENCE
 Independent specialist evidence + diversity weighting + Supreme Meta-Oracle.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  const SPECIALISTS=[
    "TECHNICAL","FNO","MACRO","CATALYST","GLOBAL","MEMORY","BEAR","RISK"
  ];

  function specialistVote(agent={}){
    const confidence=clamp(n(agent.confidence,50),0,100);
    const strength=clamp(n(agent.strength,50),0,100);
    const reliability=clamp(n(agent.reliability,50),0,100);
    const freshness=clamp(n(agent.freshness,50),0,100);
    const direction=String(agent.direction||"WAIT").toUpperCase();
    const base=(confidence*.35+strength*.30+reliability*.25+freshness*.10);
    return {...agent,score:clamp(base,0,100),direction};
  }

  function diversityWeight(agent, allAgents=[]){
    const family=agent.family||agent.name||"UNKNOWN";
    const correlated=allAgents.filter(a=>(a.family||a.name||"UNKNOWN")===family).length;
    return 1/Math.max(1,correlated);
  }

  function swarm(agents=[]){
    const valid=agents.map(specialistVote).filter(a=>a.direction!=="WAIT");
    let buy=0,sell=0,total=0,risk=0;
    const votes=[];
    for(const a of valid){
      const w=Math.max(.05,n(a.weight,1))*diversityWeight(a,valid);
      total+=w;
      if(a.direction==="BUY") buy+=a.score*w;
      if(a.direction==="SELL") sell+=a.score*w;
      if(a.direction==="RISK" || a.riskFlag) risk+=a.score*w;
      votes.push({...a,diversityWeight:w});
    }
    const denom=Math.max(.001,total);
    const buyScore=buy/denom, sellScore=sell/denom;
    const edge=buyScore-sellScore;
    const agreement=clamp(50+Math.abs(edge)*1.2,0,100);
    return {
      votes,buyScore,sellScore,edge,agreement,
      riskScore:clamp(risk/denom,0,100),
      coverage:clamp(valid.length/SPECIALISTS.length*100,0,100)
    };
  }

  function supremeMetaOracle(input={}){
    const s=swarm(input.agents||[]);
    const quality=clamp(n(input.dataQuality,100),0,100);
    const calibration=clamp(n(input.calibration,50),0,100);
    const sentinel=clamp(n(input.sentinelScore,50),0,100);
    const coverage=s.coverage;

    let action="WAIT";
    if(quality<60 || sentinel<40 || coverage<50) action="NO-TRADE";
    else if(s.riskScore>=78) action="NO-TRADE";
    else if(s.agentsDissent===true || s.agreement<55) action="WAIT";
    else if(s.edge>=15 && calibration>=65) action="BUY";
    else if(s.edge<=-15 && calibration>=65) action="SELL";

    const confidence=clamp(
      s.agreement*.30 + calibration*.20 + quality*.15 +
      sentinel*.20 + coverage*.10 + (100-s.riskScore)*.05,0,100
    );
    return {...s,action,confidence,market:input.market||"NSE"};
  }

  global.SwarmV280000={SPECIALISTS,specialistVote,diversityWeight,swarm,supremeMetaOracle};
})(typeof globalThis!=="undefined"?globalThis:window);
