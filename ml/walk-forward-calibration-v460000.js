/*
 V460000 ONLINE WALK-FORWARD BACKTEST + CALIBRATION LAB
 Measures probability calibration and out-of-sample performance, then supplies
 reliability adjustments to downstream decision engines. Research only.
*/
(function(global){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;

  function brier(predictions=[]){
    if(!predictions.length)return null;
    return predictions.reduce((s,x)=>s+Math.pow(n(x.probability,.5)-n(x.outcome,0),2),0)/predictions.length;
  }

  function accuracy(predictions=[]){
    if(!predictions.length)return null;
    return predictions.reduce((s,x)=>{
      const p=n(x.probability,.5)>=.5?1:0;
      return s+(p===n(x.outcome,0)?1:0);
    },0)/predictions.length;
  }

  function calibrationBins(predictions=[],bins=10){
    const out=[];
    for(let i=0;i<bins;i++){
      const lo=i/bins, hi=(i+1)/bins;
      const rows=predictions.filter(x=>{
        const p=n(x.probability,.5);
        return p>=lo && (i===bins-1?p<=hi:p<hi);
      });
      const avgP=rows.length?rows.reduce((s,x)=>s+n(x.probability,.5),0)/rows.length:null;
      const actual=rows.length?rows.reduce((s,x)=>s+n(x.outcome,0),0)/rows.length:null;
      out.push({bin:i,lower:lo,upper:hi,count:rows.length,avgProbability:avgP,actualRate:actual,
        calibrationError:avgP===null?null:Math.abs(avgP-actual)});
    }
    return out;
  }

  function confusion(predictions=[],threshold=.5){
    let tp=0,tn=0,fp=0,fn=0;
    for(const x of predictions){
      const y=n(x.outcome,0), p=n(x.probability,.5)>=threshold?1:0;
      if(p&&y)tp++; else if(!p&&!y)tn++; else if(p&&!y)fp++; else fn++;
    }
    const precision=tp+fp?tp/(tp+fp):null;
    const recall=tp+fn?tp/(tp+fn):null;
    return {tp,tn,fp,fn,precision,recall};
  }

  function returns(trades=[]){
    let equity=1, peak=1, maxDD=0, wins=0, losses=0, total=0;
    for(const t of trades){
      const r=n(t.returnPct,0)/100;
      equity*=1+r;
      peak=Math.max(peak,equity);
      maxDD=Math.max(maxDD,(peak-equity)/peak);
      if(r>0)wins++; else if(r<0)losses++;
      total+=r;
    }
    const count=wins+losses;
    return {equity, totalReturnPct:(equity-1)*100, maxDrawdownPct:maxDD*100,
      winRate:count?wins/count:null, trades:count};
  }

  function evaluate(predictions=[],trades=[],opts={}){
    const c=confusion(predictions,n(opts.threshold,.5));
    const cal=calibrationBins(predictions,n(opts.bins,10));
    const br=brier(predictions);
    const acc=accuracy(predictions);
    const ret=returns(trades);
    const meanCalErr=cal.filter(x=>x.calibrationError!==null)
      .reduce((s,x)=>s+x.calibrationError,0)/(cal.filter(x=>x.calibrationError!==null).length||1);
    const reliability=clamp(
      100*(.30*(1-(br===null?1:br))+
      .25*(acc===null?0:acc)+
      .25*(1-meanCalErr)+
      .20*(ret.winRate===null?0:ret.winRate)),0,100);
    return {brier:br,accuracy:acc,confusion:c,calibration:cal,
      meanCalibrationError:meanCalErr,returns:ret,reliabilityScore:reliability};
  }

  function walkForward(rows=[],opts={}){
    const train=Math.max(10,n(opts.trainWindow,100));
    const test=Math.max(1,n(opts.testWindow,25));
    const step=Math.max(1,n(opts.step,25));
    const windows=[];
    for(let start=0;start+train+test<=rows.length;start+=step){
      const tr=rows.slice(start,start+train), te=rows.slice(start+train,start+train+test);
      windows.push({start,trainCount:tr.length,testCount:te.length,
        test:evaluate(te,[],opts)});
    }
    const valid=windows.filter(w=>w.test.reliabilityScore!==null);
    const avg=valid.length?valid.reduce((s,w)=>s+w.test.reliabilityScore,0)/valid.length:null;
    return {windows,averageOutOfSampleReliability:avg,windowCount:windows.length};
  }

  function reliabilityAdjustment(score){
    const s=clamp(n(score,50),0,100);
    return clamp(.55+.45*(s/100),.55,1);
  }

  global.CalibrationLabV460000={
    brier,accuracy,calibrationBins,confusion,returns,evaluate,walkForward,reliabilityAdjustment
  };
})(typeof globalThis!=="undefined"?globalThis:window);
