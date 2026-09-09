/*
 V350000 ADVERSARIAL RED-TEAM + MONTE CARLO SCENARIO ENGINE
 Attempts to falsify signals and stress-test outcome distributions.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function percentile(values,q){
    const a=values.filter(Number.isFinite).slice().sort((x,y)=>x-y);
    if(!a.length)return null;
    const p=clamp(q,0,1)*(a.length-1), lo=Math.floor(p), hi=Math.ceil(p);
    return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(p-lo);
  }

  function monteCarlo(baseMove, sigma, trials=5000, shocks=[]){
    const count=Math.max(100,Math.floor(n(trials,5000)));
    const s=Math.max(.000001,Math.abs(n(sigma,.01)));
    const outcomes=[];
    for(let i=0;i<count;i++){
      let shock=0;
      for(const x of (shocks||[])){
        const p=clamp(n(x.probability,0),0,1);
        if(Math.random()<p) shock+=n(x.impact,0);
      }
      // Box-Muller normal draw
      const u=Math.max(1e-12,Math.random()), v=Math.max(1e-12,Math.random());
      const z=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
      outcomes.push(n(baseMove,0)+z*s+shock);
    }
    const wins=outcomes.filter(x=>x>0).length;
    return {
      trials:count,
      probabilityPositive:wins/count,
      mean:outcomes.reduce((a,b)=>a+b,0)/count,
      p05:percentile(outcomes,.05),
      p25:percentile(outcomes,.25),
      p50:percentile(outcomes,.50),
      p75:percentile(outcomes,.75),
      p95:percentile(outcomes,.95),
      tailLossProbability:outcomes.filter(x=>x<-.02).length/count
    };
  }

  function redTeam(thesis, attacks=[]){
    const results=(attacks||[]).map(a=>{
      const probability=clamp(n(a.probability,.2),0,1);
      const impact=Math.abs(n(a.impact,0));
      const severity=clamp(100*probability*impact,0,100);
      return {...a,severity};
    }).sort((a,b)=>b.severity-a.severity);
    const max=results[0]?.severity||0;
    return {
      thesis,
      attacks:results,
      strongestAttack:results[0]||null,
      fragilityScore:max,
      verdict:max>=65?"FRAGILE":max>=40?"STRESSED":"ROBUST"
    };
  }

  function confidenceHaircut(rawConfidence, redTeamResult, monteCarloResult){
    const fragility=n(redTeamResult?.fragilityScore,0);
    const tail=n(monteCarloResult?.tailLossProbability,0);
    const mcUp=n(monteCarloResult?.probabilityPositive,.5);
    const haircut=clamp(fragility*.35+tail*100*.25,0,55);
    const adjusted=clamp(n(rawConfidence,50)-haircut,0,100);
    return {
      rawConfidence:n(rawConfidence,50),
      haircut,
      adjustedConfidence:adjusted,
      monteCarloPositiveProbability:mcUp,
      status:adjusted>=70?"STRONG":adjusted>=55?"MODERATE":"WEAK"
    };
  }

  function stressMatrix(baseMove, sigma, scenarioSets=[]){
    return scenarioSets.map(s=>({
      ...s,
      simulation:monteCarlo(baseMove,sigma,s.trials||3000,s.shocks||[])
    }));
  }

  function evaluate(input={}){
    const mc=monteCarlo(input.baseMove,input.sigma,input.trials,input.shocks);
    const rt=redTeam(input.thesis||"UNSPECIFIED",input.attacks||[]);
    const cf=confidenceHaircut(input.rawConfidence,rt,mc);
    let action=input.action||"WAIT";
    if(cf.adjustedConfidence<55 || rt.verdict==="FRAGILE") action="WAIT";
    if(mc.tailLossProbability>=.35) action="NO-TRADE";
    return {monteCarlo:mc,redTeam:rt,confidence:cf,action};
  }

  global.AdversarialV350000={percentile,monteCarlo,redTeam,confidenceHaircut,stressMatrix,evaluate};
})(typeof globalThis!=="undefined"?globalThis:window);
