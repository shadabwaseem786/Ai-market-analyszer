// V19300: walk-forward baseline orchestration. Input rows must already be quality-checked.
const {makeFeatures}=require("./feature-factory");
const {labelAt}=require("./labels");
const {folds}=require("./walk-forward");
const {trainLogistic,predict,standardize}=require("./logistic-trainer");
function matrix(rows,start,end,horizon){
 const X=[],y=[],meta=[];
 for(let i=start;i<end;i++){const f=makeFeatures(rows,i),l=labelAt(rows,i,{horizon});if(l.label==="UP"||l.label==="DOWN"){X.push([f.return5,f.return15,f.return30,f.volatility20,f.volatility60,f.ema20Gap,f.ema50Gap,f.volumeZ,f.rangePosition]);y.push(l.label==="UP"?1:0);meta.push({i,label:l})}}
 return {X,y,meta};
}
function run(rows,opts={}){
 const fs=folds(rows.length,opts),results=[];
 for(const fold of fs){const tr=matrix(rows,fold.train[0],fold.train[1],opts.horizon||30),te=matrix(rows,fold.test[0],fold.test[1],opts.horizon||30);if(tr.X.length<20||te.X.length<1)continue;
  const z=standardize(tr.X,te.X),m=trainLogistic(z.train,tr.y,opts);let correct=0;
  for(let i=0;i<z.test.length;i++){const p=predict(m,z.test[i]),pred=p>=.5?"UP":"DOWN";if(pred===te.meta[i].label.label)correct++}
  results.push({fold,trainSamples:tr.X.length,testSamples:te.X.length,accuracy:correct/te.X.length,model:m.model});
 }
 return {version:"V19300",folds:results};
}
module.exports={run};
