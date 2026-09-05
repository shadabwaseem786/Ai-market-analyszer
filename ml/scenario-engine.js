// V43500: bull/base/bear scenario probabilities.
function scenarios({bull=.33,base=.34,bear=.33}={}){const s=bull+base+bear||1;return{bull:bull/s,base:base/s,bear:bear/s}}module.exports={scenarios};