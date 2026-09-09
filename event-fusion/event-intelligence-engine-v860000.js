/* V860000 EVENT + GEOPOLITICAL + MACRO INTELLIGENCE */
(function(global){
 const n=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const mean=a=>a.length?a.reduce((s,x)=>s+n(x),0)/a.length:0;
 function credibility(x={}){const score=clamp(.3*n(x.trackRecord,.5)+.25*n(x.primarySource,.5)+.2*n(x.specificity,.5)+.15*n(x.independentConfirmation,.5)+.1*n(x.transparency,.5),0,1);return{score,state:score>.75?"HIGH":score>.5?"MEDIUM":"LOW"}}
 function cluster(stories=[]){const groups={};stories.forEach(s=>{const k=(s.topic||"UNKNOWN").toUpperCase();(groups[k]??=[]).push(s)});return Object.entries(groups).map(([topic,items])=>({topic,count:items.length,items}))}
 function eventExtract(x={}){return{type:x.type||"UNKNOWN",entities:x.entities||[],location:x.location||null,trigger:x.trigger||null,expectedImpact:n(x.expectedImpact,.5),confidence:n(x.confidence,.5)}}
 function sentiment(x={}){const p=n(x.positive),q=n(x.negative),u=n(x.uncertain);const total=p+q+u||1;return{positive:p/total,negative:q/total,uncertain:u/total,net:(p-q)/total}}
 function surprise(actual,expected){const a=n(actual),e=n(expected);return{difference:a-e,normalized:e? (a-e)/Math.abs(e):a,score:clamp(Math.abs(e? (a-e)/Math.abs(e):a),0,1)}}
 function geoRisk(x={}){const score=clamp(.25*n(x.conflict,.5)+.2*n(x.escalation,.5)+.2*n(x.energyExposure,.5)+.2*n(x.shippingExposure,.5)+.15*n(x.contagion,.5),0,1);return{score,state:score>.75?"SEVERE":score>.5?"ELEVATED":score>.3?"WATCH":"LOW"}}
 function iranMiddleEast(x={}){const score=clamp(.3*n(x.militaryEscalation,.5)+.2*n(x.oilShock,.5)+.2*n(x.shippingDisruption,.5)+.15*n(x.sanctions,.5)+.15*n(x.regionalSpread,.5),0,1);return{score,state:score>.8?"CRITICAL":score>.6?"HIGH":score>.4?"ELEVATED":"NORMAL"}}
 function macro(x={}){return{inflationSurprise:n(x.inflationSurprise),growthSurprise:n(x.growthSurprise),ratesSurprise:n(x.ratesSurprise),liquidity:n(x.liquidity,.5),macroRisk:clamp(mean([Math.abs(n(x.inflationSurprise)),Math.abs(n(x.growthSurprise)),Math.abs(n(x.ratesSurprise)),1-n(x.liquidity,.5)]),0,1)}}
 function transmission(x={}){return{oilToInflation:n(x.oilToInflation,.5),fxToInflation:n(x.fxToInflation,.5),ratesToEquity:n(x.ratesToEquity,.5),globalRiskToIndia:n(x.globalRiskToIndia,.5),overall:clamp(mean([n(x.oilToInflation,.5),n(x.fxToInflation,.5),n(x.ratesToEquity,.5),n(x.globalRiskToIndia,.5)]),0,1)}}
 function sectorImpact(sectors=[],eventScore=.5){return sectors.map(s=>({...s,impact:clamp(n(s.sensitivity,.5)*n(eventScore,.5),0,1)})).sort((a,b)=>b.impact-a.impact)}
 function halfLife(hours){const h=Math.max(0,n(hours));return Math.exp(-h/Math.max(1,n(arguments[1],24)))}
 function severity(x={}){const score=clamp(.3*n(x.marketReach,.5)+.25*n(x.persistence,.5)+.2*n(x.surprise,.5)+.15*n(x.transmission,.5)+.1*n(x.credibility,.5),0,1);return{score,state:score>.8?"CRITICAL":score>.6?"HIGH":score>.35?"MEDIUM":"LOW"}}
 function scenario(x={}){const bull=clamp(n(x.bull,.33),0,1),base=clamp(n(x.base,.34),0,1),bear=clamp(n(x.bear,.33),0,1),s=bull+base+bear||1;return{bull:bull/s,base:base/s,bear:bear/s}}
 function eventFno(x={}){const risk=n(x.severity,.5),oil=n(x.oilShock,.5),vol=n(x.volatility,.5),index=n(x.indexSensitivity,.5);return{risk:clamp(.4*risk+.25*oil+.2*vol+.15*index,0,1),fnoImpact:risk>.7?"HIGH":risk>.45?"MEDIUM":"LOW"}}
 function fuse(x={}){const s=mean([n(x.credibility,.5),n(x.surprise,.5),n(x.geoRisk,.5),n(x.macroRisk,.5),n(x.severity,.5),n(x.fnoImpact,.5)]);return{score:clamp(s,0,1),direction:n(x.direction,.5)>.6?"BULLISH":n(x.direction,.5)<.4?"BEARISH":"NEUTRAL",confidence:Math.abs(s-.5)*2}}
 global.EventV860000={credibility,cluster,eventExtract,sentiment,surprise,geoRisk,iranMiddleEast,macro,transmission,sectorImpact,halfLife,severity,scenario,eventFno,fuse};
})(typeof globalThis!=="undefined"?globalThis:window);