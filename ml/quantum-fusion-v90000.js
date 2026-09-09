export function quantumFusion(features={}){
  const keys=['trend','momentum','volume','oi','pcr','iv','news','regime','sector','macro','risk'];
  const vals=keys.map(k=>Number(features[k] ?? 50));
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const variance=vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length;
  const disagreement=Math.min(100,Math.sqrt(variance));
  const confidence=Math.max(0,Math.min(99,Math.round(mean-disagreement*0.55)));
  const abstain=disagreement>24 || confidence<62 || Number(features.risk ?? 50)>78;
  return {confidence, disagreement, abstain, action: abstain?'WAIT':confidence>=78?'BUY':confidence<=42?'SELL':'WAIT'};
}
