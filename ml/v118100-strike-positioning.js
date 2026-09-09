// V118100 strike-wise positioning map.
function map(chain=[]){
 return chain.map((x,i)=>({strike:x.strike??i,callOI:Number(x.callOI)||0,putOI:Number(x.putOI)||0,callOIChange:Number(x.callOIChange)||0,putOIChange:Number(x.putOIChange)||0,callIV:Number(x.callIV)||null,putIV:Number(x.putIV)||null}))
 .map(x=>({...x,netOI:+(x.putOI-x.callOI).toFixed(2),netOIChange:+(x.putOIChange-x.callOIChange).toFixed(2)}));
}
module.exports={map};