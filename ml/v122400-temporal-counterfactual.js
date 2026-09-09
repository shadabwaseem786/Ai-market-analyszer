// V122400 temporal counterfactual sequence tester.
function test(sequence=[],removeId=null){
 const original=sequence.map(x=>x.id), altered=sequence.filter(x=>x.id!==removeId).map(x=>x.id);
 return {version:"V122400",removed:removeId,original,altered,changed:original.join("|")!==altered.join("|"),counterfactualResearchOnly:true};
}
module.exports={test};