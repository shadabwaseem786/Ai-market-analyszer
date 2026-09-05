// V117400 immutable feature snapshot for reproducible research.
function snapshot(features={},context={}){
 return {version:"V117400",createdAt:new Date().toISOString(),context,features,immutable:true,researchOnly:true};
}
module.exports={snapshot};