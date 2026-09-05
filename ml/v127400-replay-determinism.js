// V127400 replay determinism checker.
function compare(a,b){
 const sa=JSON.stringify(a),sb=JSON.stringify(b);
 return {version:"V127400",deterministic:sa===sb,hashA:sa.length,hashB:sb.length};
}
module.exports={compare};