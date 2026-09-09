// V118000 Indian F&O Microstructure Intelligence. Research-only.
function classify(x={}){
 const p=Number(x.priceChange)||0,o=Number(x.oiChange)||0;
 let state="NEUTRAL";
 if(p>0&&o>0)state="LONG_BUILDUP"; else if(p<0&&o>0)state="SHORT_BUILDUP"; else if(p>0&&o<0)state="SHORT_COVERING"; else if(p<0&&o<0)state="LONG_UNWINDING";
 return {version:"V118000",state,priceChange:p,oiChange:o,researchOnly:true};
}
function metrics(x={}){
 const oi=Number(x.oiChange)||0,iv=Number(x.ivChange)||0,basis=Number(x.basis)||0,pcr=Number(x.pcr)||0;
 return {version:"V118000",gammaPressure:+(Number(x.gammaPressure)||0).toFixed(3),ivExpansion:+iv.toFixed(2),basisStress:+Math.abs(basis).toFixed(2),pcr:+pcr.toFixed(3),oiMomentum:+oi.toFixed(2)};
}
module.exports={classify,metrics};