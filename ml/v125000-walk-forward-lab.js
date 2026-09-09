// V125000 Quantitative Validation & Walk-Forward Lab — research-only.
function split(data=[],train=0.6,valid=0.2){
 const n=data.length,a=Math.floor(n*train),b=a+Math.floor(n*valid);
 return {version:"V125000",train:data.slice(0,a),validation:data.slice(a,b),test:data.slice(b),sizes:{train:a,validation:b-a,test:n-b}};
}
function metrics(pred=[],actual=[]){
 const n=Math.min(pred.length,actual.length); if(!n)return {n:0};
 let brier=0,mae=0,correct=0; for(let i=0;i<n;i++){const p=Math.max(0,Math.min(1,Number(pred[i]))),y=Number(actual[i])?1:0;brier+=(p-y)**2;mae+=Math.abs(p-y);correct+=(p>=.5)===Boolean(y)}
 return {n,brier:+(brier/n).toFixed(5),mae:+(mae/n).toFixed(5),accuracy:+(100*correct/n).toFixed(2)};
}
module.exports={split,metrics};