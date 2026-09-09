// V130000 Bull/Bear Debate + Red-Team research primitive.
function debate({bull=50,bear=50,agreement=0,risk=100}={}){
 const separation=Math.abs(Number(bull)-Number(bear));
 const survival=Math.max(0,Math.min(100,50+separation*.45+Number(agreement)*.15-Number(risk)*.2));
 return {separation,survival,verdict:survival>=65?'SURVIVED':survival>=50?'FRAGILE':'FAILED'};
}
module.exports={debate};
