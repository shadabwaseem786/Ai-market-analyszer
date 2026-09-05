// V107100 feature ablation and redundancy testing.
function ablate(features=[]){
 const rows=features.map((f,i)=>({name:f.name||"F"+i,importance:Number(f.importance)||0,redundancy:Number(f.redundancy)||0,removeTested:f.removeTested===true}));
 return {version:"V107100",features:rows,highRedundancy:rows.filter(x=>x.redundancy>70).map(x=>x.name),ablationComplete:rows.length>0&&rows.every(x=>x.removeTested),researchOnly:true};
}
module.exports={ablate};