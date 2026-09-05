// V109300 catalyst lifecycle / decay model.
function decay(ageHours=0,halfLifeHours=6){
 const h=Math.max(.1,Number(halfLifeHours)||6), retention=100*Math.pow(.5,Math.max(0,Number(ageHours)||0)/h);
 return {version:"V109300",ageHours:+Number(ageHours).toFixed(2),halfLifeHours:h,retention:+retention.toFixed(2),decay:+(100-retention).toFixed(2),phase:retention>=75?"ACTIVE":retention>=35?"DECAYING":"ABSORBED"};
}
module.exports={decay};