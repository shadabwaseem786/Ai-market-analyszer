/* V86000 Godmode Decision Layer: ensemble + abstention + adversarial gates. Research/decision support only. */
(function(){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function fuse(models){const xs=models.filter(Number.isFinite);if(!xs.length)return {probability:null,spread:null,confidence:0};const p=xs.reduce((a,b)=>a+b,0)/xs.length;const spread=Math.max(...xs)-Math.min(...xs);return {probability:Math.round(p),spread:Math.round(spread),confidence:Math.round(clamp(100-spread*2,0,100))};}
 function adversarial({probability,agreement=0,risk=100,stability=0,dataHealth=0,regime="UNKNOWN"}={}){const failures=[];if(dataHealth<100)failures.push("DATA");if(agreement<75)failures.push("DISAGREEMENT");if(risk>35)failures.push("RISK");if(stability<60)failures.push("INSTABILITY");if(regime==="HIGH-VOL")failures.push("HIGH_VOL");if(Math.abs((probability??50)-50)<18)failures.push("WEAK_EDGE");return {pass:failures.length===0,failures};}
 function decide(input={}){const f=fuse(input.models||[]);const gate=adversarial({...input,probability:f.probability});const action=!gate.pass?"WAIT":f.probability>=68?"BUY":f.probability<=32?"SELL":"WAIT";return {...f,action,gate};}
 window.GodModeV86000={fuse,adversarial,decide};
})();
