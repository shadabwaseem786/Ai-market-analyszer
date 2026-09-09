/*
 V570000 CAUSAL CATALYST DEPENDENCY GRAPH
 Maps event -> macro variable -> sector -> index -> F&O instrument pathways.
 Computes path strength, bottlenecks, conflicts and affected instruments.
 Research/inference only. No order execution.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function node(id,name,type="factor",attrs={}){
    return {id,name,type,...attrs};
  }

  function edge(from,to,weight=1,lag=0,direction="NEUTRAL"){
    return {from,to,weight:n(weight,1),lag:n(lag,0),
      direction:String(direction||"NEUTRAL").toUpperCase()};
  }

  function normalizeGraph(g={}){
    return {
      nodes:Array.isArray(g.nodes)?g.nodes:[],
      edges:Array.isArray(g.edges)?g.edges:[]
    };
  }

  function propagate(graph={},sources={}){
    const g=normalizeGraph(graph);
    const values={};
    Object.entries(sources||{}).forEach(([k,v])=>values[k]=n(v,0));
    const paths=[];
    for(let pass=0;pass<g.nodes.length+2;pass++){
      let changed=false;
      for(const e of g.edges){
        if(values[e.from]===undefined) continue;
        const contribution=values[e.from]*e.weight;
        const next=(values[e.to]||0)+contribution;
        if(Math.abs(next-(values[e.to]||0))>.000001) changed=true;
        values[e.to]=clamp(next,-100,100);
        paths.push({from:e.from,to:e.to,contribution,lag:e.lag,direction:e.direction});
      }
      if(!changed) break;
    }
    return {values,paths};
  }

  function pathStrength(path=[],sources={}){
    let strength=1;
    for(const e of path) strength*=Math.abs(n(e.weight,1));
    const source=Object.values(sources||{}).reduce((a,b)=>a+Math.abs(n(b,0)),0)||1;
    return clamp(strength*source,0,100);
  }

  function bottlenecks(graph={},propagation={}){
    const g=normalizeGraph(graph);
    const incoming=Object.fromEntries(g.nodes.map(x=>[x.id,0]));
    const outgoing=Object.fromEntries(g.nodes.map(x=>[x.id,0]));
    g.edges.forEach(e=>{
      incoming[e.to]=(incoming[e.to]||0)+Math.abs(n(e.weight,1));
      outgoing[e.from]=(outgoing[e.from]||0)+Math.abs(n(e.weight,1));
    });
    return g.nodes.map(x=>({...x,incoming:incoming[x.id]||0,outgoing:outgoing[x.id]||0,
      propagatedValue:n(propagation.values?.[x.id],0)}))
      .sort((a,b)=>Math.abs(b.propagatedValue)-Math.abs(a.propagatedValue));
  }

  function affectedInstruments(graph={},propagation={},types=["stock","index","fno"]){
    const g=normalizeGraph(graph);
    return g.nodes.filter(x=>types.includes(String(x.type).toLowerCase()))
      .map(x=>({id:x.id,name:x.name,type:x.type,
        impact:clamp(Math.abs(n(propagation.values?.[x.id],0)),0,100),
        signedImpact:n(propagation.values?.[x.id],0)}))
      .sort((a,b)=>b.impact-a.impact);
  }

  function conflicts(graph={},propagation={}){
    const g=normalizeGraph(graph), signs={};
    g.edges.forEach(e=>{
      const v=n(propagation.values?.[e.from],0)*n(e.weight,1);
      const s=v>0?1:v<0?-1:0;
      if(!signs[e.to]) signs[e.to]=[];
      if(s) signs[e.to].push(s);
    });
    return Object.entries(signs).filter(([,v])=>new Set(v).size>1)
      .map(([node,signs])=>({node,signs,conflict:true}));
  }

  function analyze(input={}){
    const p=propagate(input.graph,input.sources);
    const affected=affectedInstruments(input.graph,p,input.instrumentTypes);
    const c=conflicts(input.graph,p);
    const top=affected[0];
    let decision=String(input.direction||"WAIT").toUpperCase();
    if(c.length) decision="WAIT";
    if(input.dataBlocked===true) decision="NO-TRADE";
    return {propagation:p,affected,bottlenecks:bottlenecks(input.graph,p),
      conflicts:c,topAffected:top||null,decision};
  }

  global.CatalystDependencyGraphV570000={node,edge,normalizeGraph,propagate,
    pathStrength,bottlenecks,affectedInstruments,conflicts,analyze};
})(typeof globalThis!=="undefined"?globalThis:window);
