// V100500 conservative decision policy. Research/analysis only.
function policy(x={}){
 const u=Number(x.uncertainty)||100, rob=Number(x.robustness)||0, data=Number(x.dataHealth)||0, debate=x.debate||"TIED";
 let action="WAIT";
 if(data<75||u>60||rob<55) action="ABSTAIN";
 else if(debate==="BULL"&&rob>=70&&u<35) action="WATCH-LONG";
 else if(debate==="BEAR"&&rob>=70&&u<35) action="WATCH-SHORT";
 return {version:"V100500",action,executionDisabled:true,reason:action==="ABSTAIN"?"Evidence/uncertainty gate":"Research watch state only"};
}
module.exports={policy};