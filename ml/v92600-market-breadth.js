// V92600: breadth state contract.
function breadth(advancers=0,decliners=0){const d=Number(advancers)+Number(decliners)||1;return(Number(advancers)-Number(decliners))/d}module.exports={breadth};