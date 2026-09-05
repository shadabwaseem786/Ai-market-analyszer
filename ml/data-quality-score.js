// V26200: dataset quality score.
function score({missing=0,duplicates=0,outliers=0,alignment=1}={}){return Math.max(0,Math.min(1,alignment-(missing+duplicates+outliers)/100))}module.exports={score};