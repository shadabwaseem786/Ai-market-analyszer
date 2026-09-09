/*
 V340000 CAUSAL GRAPH + COUNTERFACTUAL MARKET SIMULATOR
 Structured causal dependencies, shock propagation and scenario stress testing.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function topologicalOrder(nodes, edges){
    const indeg={}; nodes.forEach(x=>indeg[x]=0);
    edges.forEach(e=>{if(indeg[e.to]!==undefined)indeg[e.to]++;});
    const q=nodes.filter(x=>indeg[x]===0), out=[];
    while(q.length){
      const u=q.shift(); out.push(u);
      edges.filter(e=>e.from===u).forEach(e=>{indeg[e.to]--;if(indeg[e.to]===0)q.push(e.to);});
    }
    return out.length===nodes.length?out:nodes.slice();
  }

  function propagate(state, nodes, edges){
    const values={...state};
    const order=topologicalOrder(nodes,edges);
    for(const node of order){
      const incoming=edges.filter(e=>e.to===node);
      if(!incoming.length)continue;
      let delta=0;
      for(const e of incoming){
        const source=n(values[e.from],0);
        const effect=n(e.effect,0);
        delta+=source*effect;
      }
      values[node]=n(values[node],0)+delta;
    }
    return values;
  }

  function scenario(base, shocks, nodes, edges){
    const shocked={...base};
    for(const [k,v] of Object.entries(shocks||{})) shocked[k]=n(shocked[k],0)+n(v,0);
    const result=propagate(shocked,nodes,edges);
    const deltas={};
    for(const k of nodes)deltas[k]=n(result[k],0)-n(base[k],0);
    return {state:result,deltas};
  }

  function stressTest(base, scenarios, nodes, edges, scoreFn){
    return (scenarios||[]).map(s=>{
      const r=scenario(base,s.shocks||{},nodes,edges);
      const score=typeof scoreFn==="function"?n(scoreFn(r),0):0;
      return {...s,...r,score};
    }).sort((a,b)=>b.score-a.score);
  }

  function causalAttribution(base, scenarioResult, target, nodes, edges){
    const contributions=[];
    const targetEdges=edges.filter(e=>e.to===target);
    for(const e of targetEdges){
      contributions.push({
        cause:e.from,
        effect:n(e.effect,0),
        sourceChange:n(scenarioResult.deltas[e.from],0),
        contribution:n(e.effect,0)*n(scenarioResult.deltas[e.from],0)
      });
    }
    return contributions.sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution));
  }

  function counterfactual(base, removeCause, nodes, edges, target){
    const modified=edges.filter(e=>e.from!==removeCause);
    const normal=propagate(base,nodes,edges);
    const cf=propagate(base,nodes,modified);
    return {
      removedCause:removeCause,
      target,
      normal:n(normal[target],0),
      counterfactual:n(cf[target],0),
      impact:n(cf[target],0)-n(normal[target],0)
    };
  }

  global.CausalSimulatorV340000={topologicalOrder,propagate,scenario,stressTest,causalAttribution,counterfactual};
})(typeof globalThis!=="undefined"?globalThis:window);
