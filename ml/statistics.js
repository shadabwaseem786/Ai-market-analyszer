// V20700: bootstrap confidence interval for OOS mean return.
function bootstrap(values,{iterations=1000,seed=42}={}){let s=seed>>>0,next=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296};const a=values.filter(Number.isFinite),n=a.length;if(!n)return null;const means=[];for(let k=0;k<iterations;k++){let z=0;for(let i=0;i<n;i++)z+=a[Math.floor(next()*n)];means.push(z/n)}means.sort((x,y)=>x-y);return {n,mean:a.reduce((x,y)=>x+y,0)/n,low:means[Math.floor(iterations*.025)],high:means[Math.floor(iterations*.975)]}}
module.exports={bootstrap};
