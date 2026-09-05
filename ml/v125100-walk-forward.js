// V125100 rolling walk-forward evaluation.
function evaluate(data=[],trainSize=100,testSize=20,step=20,fn){
 const folds=[]; for(let start=0;start+trainSize+testSize<=data.length;start+=step){const train=data.slice(start,start+trainSize),test=data.slice(start+trainSize,start+trainSize+testSize);folds.push({start,trainSize:train.length,testSize:test.length,result:typeof fn==="function"?fn(train,test):null})}
 return {version:"V125100",folds,count:folds.length,researchOnly:true};
}
module.exports={evaluate};