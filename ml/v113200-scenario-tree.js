// V113200 branching scenario tree.
function build(root={},branches=[]){
 const children=branches.map((b,i)=>({id:b.id||"S"+(i+1),probability:Math.max(0,Number(b.probability)||0),state:b.state||{},assumptions:b.assumptions||[]}));
 const total=children.reduce((a,b)=>a+b.probability,0)||1;
 return {version:"V113200",root,children:children.map(x=>({...x,probability:+(x.probability/total*100).toFixed(2)})),normalized:true};
}
module.exports={build};