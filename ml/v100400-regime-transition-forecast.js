// V100400 regime transition reasoning.
function forecast(regime="UNKNOWN",risk=50,vol=50){
 const r=String(regime).toUpperCase();
 let transition=r==="TRANSITION"?72:r==="HIGH-VOL"?62:r==="LOW-VOL"?28:45;
 transition=Math.max(0,Math.min(100,transition+(Number(risk)-50)*.25+(Number(vol)-50)*.15));
 return {version:"V100400",current:r,transitionRisk:+transition.toFixed(1),nextState:transition>65?"STRESS/TRANSITION":transition<35?"STABLE":"MIXED"};
}
module.exports={forecast};