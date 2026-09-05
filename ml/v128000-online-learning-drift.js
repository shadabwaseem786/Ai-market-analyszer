// V128000 Online Learning & Drift Adaptation — shadow-learning, research-only.
function error(prediction={},outcome={}){
 const p=Math.max(0,Math.min(1,Number(prediction.probability??.5))),y=Number(outcome.value??0);
 return {version:"V128000",error:+(p-y).toFixed(5),absoluteError:+Math.abs(p-y).toFixed(5),squaredError:+((p-y)**2).toFixed(5),regime:prediction.regime||"UNKNOWN",model:prediction.model||"ENSEMBLE"};
}
function drift(reference={},current={},threshold=20){
 const keys=new Set([...Object.keys(reference),...Object.keys(current)]), changes=[];
 for(const k of keys){const a=Number(reference[k])||0,b=Number(current[k])||0,d=b-a;if(Math.abs(d)>=threshold)changes.push({feature:k,reference:a,current:b,delta:+d.toFixed(4)})}
 return {version:"V128000",drift:changes.length>0,changes};
}
module.exports={error,drift};