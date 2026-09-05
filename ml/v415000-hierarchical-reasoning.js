// V415000 hierarchical reasoning.
function reason(levels=[]){return {version:"V415000",levels:levels.map((x,i)=>({...x,level:i+1})),researchOnly:true};} module.exports={reason};