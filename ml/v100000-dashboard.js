// V100000 dashboard adapter. Loaded client-side; consumes existing validated UI observations only.
(function(){
 "use strict";
 const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 function n(t,d=50){const v=parseFloat(String(t).replace(/[^0-9.-]/g,""));return Number.isFinite(v)?v:d}
 function extract(){
  const tr=document.querySelector("#rows tr"); if(!tr)return null;
  const cells=[...tr.children].map(x=>x.textContent.trim());
  const ids=id=>document.getElementById(id)?.textContent?.trim()||"";
  const score=n(cells[8],50), conf=n(cells[9],50), regime=cells[10]||"UNKNOWN";
  const risk=regime==="HIGH-VOL"?75:regime==="TRANSITION"?58:35;
  return {score,confidence:conf,regime,risk,dataHealth:n(ids("health"),50),catalystConfidence:n(ids("fusionConf"),50),agreement:n(ids("factorAgree"),50),bias:cells[12]||"NEUTRAL"};
 }
 function calculate(s){
  const evidence=.22*s.score+.16*s.confidence+.12*s.catalystConfidence+.16*s.agreement+.20*s.dataHealth+.14*(100-s.risk);
  const contradiction=Math.abs(s.score-50)*.18+Math.max(0,55-s.agreement)*.35;
  const uncertainty=Math.max(0,Math.min(100,12+(100-s.dataHealth)*.28+(100-s.confidence)*.18+s.risk*.16+contradiction*.55));
  const bull=Math.max(0,Math.min(100,evidence+(50-s.risk)*.12-contradiction));
  const bear=Math.max(0,Math.min(100,100-evidence+(s.risk-50)*.12+contradiction));
  const robustness=Math.max(0,Math.min(100,.45*evidence+.35*s.dataHealth+.20*(100-uncertainty)));
  let decision="ABSTAIN";
  if(s.dataHealth<75||uncertainty>62||s.agreement<48)decision="WAIT";
  else if(bull>=66&&bull-bear>=12)decision="BULLISH";
  else if(bear>=66&&bear-bull>=12)decision="BEARISH";
  return {evidence,uncertainty,bull,bear,robustness,decision};
 }
 function mount(){
  if(document.getElementById("v100000"))return;
  const anchor=document.getElementById("godmode")||document.querySelector("main .card");
  if(!anchor)return;
  const el=document.createElement("section");el.id="v100000";el.className="card";
  el.style.cssText="border:1px solid #735a2c;background:#0c151d;box-shadow:0 0 28px rgba(80,60,20,.22)";
  el.innerHTML='<div class="section"><h2>🧠 V100000 AGI-STYLE MARKET REASONING</h2><span class="pill">RESEARCH ONLY • NO EXECUTION</span></div><div class="grid"><div class="metric">Reasoning State<b id="v10State">WAITING</b></div><div class="metric">Evidence<b id="v10Evidence">—</b></div><div class="metric">Bull Probability<b id="v10Bull">—</b></div><div class="metric">Bear Probability<b id="v10Bear">—</b></div><div class="metric">Uncertainty<b id="v10Unc">—</b></div><div class="metric">Robustness<b id="v10Rob">—</b></div></div><div id="v10Explain" class="banner">Waiting for validated market observations…</div><div class="chips"><span>🌐 World Model</span><span>🕸️ Causal Reasoning</span><span>⚔️ Bull/Bear Debate</span><span>🔄 Counterfactuals</span><span>🧭 Regime Transition</span><span>🛡️ Uncertainty Gate</span><span>🚫 Auto-Trade OFF</span></div><p><small>AGI-style means a unified reasoning architecture, not literal artificial general intelligence. This layer cannot guarantee prediction accuracy and will abstain when evidence, data quality, agreement or uncertainty fails its gates.</small></p>';
  anchor.parentNode.insertBefore(el,anchor);
 }
 function tick(){
  mount();const s=extract();if(!s)return;const r=calculate(s);
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set("v10State",r.decision);set("v10Evidence",r.evidence.toFixed(1)+"%");set("v10Bull",r.bull.toFixed(1)+"%");set("v10Bear",r.bear.toFixed(1)+"%");set("v10Unc",r.uncertainty.toFixed(1)+"%");set("v10Rob",r.robustness.toFixed(1)+"%");
  const explain=r.decision==="ABSTAIN"?"ABSTAIN: hard data/uncertainty gate.":r.decision==="WAIT"?"WAIT: evidence is not sufficiently coherent.":r.decision+" watch state: research signal only.";
  const x=document.getElementById("v10Explain");if(x)x.textContent=explain+" "+s.regime+" • data "+s.dataHealth+"% • catalyst "+s.catalystConfidence+"% • agreement "+s.agreement+"%.";
 }
 document.addEventListener("DOMContentLoaded",()=>{tick();setInterval(tick,2500)});
})();