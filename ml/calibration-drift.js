// V34300: calibration drift monitoring.
function compare(oldEce,newEce,maxIncrease=.03){return{oldEce,newEce,delta:newEce-oldEce,alert:newEce-oldEce>maxIncrease}}module.exports={compare};