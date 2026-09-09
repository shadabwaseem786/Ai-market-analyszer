/*
 V510000 FRONTEND SECURITY CONTRACT
 Secrets must remain server-side. This module only describes safe client behavior.
*/
(function(global){
 function securityPolicy(){return {noClientSecrets:true,noBrokerTokensInLocalStorage:true,noRawProviderCredentialsInBundles:true,serverSideValidation:true,rateLimitRequired:true,contentSecurityPolicyRecommended:true}}
 global.SecurityPolicyV510000={securityPolicy};
})(typeof globalThis!=="undefined"?globalThis:window);
