// V19100: pure-JS baseline trainer for reproducible offline research.
function sigmoid(z){return 1/(1+Math.exp(-Math.max(-30,Math.min(30,z))))}
function trainLogistic(X,y,{epochs=250,lr=.03,l2=.001}={}){
 const d=X[0]?.length||0,w=Array(d).fill(0),b=0;
 for(let e=0;e<epochs;e++){const gw=Array(d).fill(0);let gb=0;
  for(let i=0;i<X.length;i++){const p=sigmoid(w.reduce((s,a,j)=>s+a*X[i][j],b)),err=p-(y[i]?1:0);gb+=err;for(let j=0;j<d;j++)gw[j]+=err*X[i][j]}
  for(let j=0;j<d;j++)w[j]-=lr*(gw[j]/Math.max(1,X.length)+l2*w[j]);b-=lr*gb/Math.max(1,X.length);
 }
 return {weights:w,bias:b,model:"logistic-baseline-v19100"};
}
function predict(m,x){return sigmoid(m.bias+m.weights.reduce((s,w,j)=>s+w*x[j],0))}
function standardize(train,test){
 const d=train[0]?.length||0,mu=Array(d).fill(0),sd=Array(d).fill(0);
 for(let j=0;j<d;j++){mu[j]=train.reduce((s,r)=>s+r[j],0)/Math.max(1,train.length);sd[j]=Math.sqrt(train.reduce((s,r)=>s+(r[j]-mu[j])**2,0)/Math.max(1,train.length-1))||1}
 const f=r=>r.map((v,j)=>(v-mu[j])/sd[j]);return {train:train.map(f),test:test.map(f),mu,sd};
}
module.exports={trainLogistic,predict,standardize};
