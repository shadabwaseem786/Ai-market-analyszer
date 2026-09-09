// V123400 detects feature drift between reference and current regimes.
function detect(reference={},current={},threshold=20){
 const keys=new Set([...Object.keys(reference),...Object.keys(current)]),drift=[];
 for(const k of keys){const a=Number(reference[k])||0,b=Number(current[k])||0,d=b-a;if(Math.abs(d)>=threshold)drift.push({feature:k,reference:a,current:b,delta:d})}
 return {version:"V123400",driftCount:drift.length,drift,materialDrift:drift.length>0};
}
module.exports={detect};