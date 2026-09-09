// V92700: event-impact decay contract.
function decay(hours,halfLife=6){return Math.exp(-Math.max(0,Number(hours)||0)*Math.log(2)/halfLife)}module.exports={decay};