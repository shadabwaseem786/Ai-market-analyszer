'use strict';
const runtime=require('../netlify/functions/v730-runtime');
module.exports=async function handler(req,res){
  try{
    const r=await runtime.handler(req);
    const status=Number(r?.statusCode)||200;
    res.status(status).setHeader('content-type','application/json').setHeader('cache-control','no-store').setHeader('access-control-allow-origin','*');
    return res.send(r?.body||JSON.stringify({status:'DEGRADED',error:'Empty runtime response'}));
  }catch(e){
    return res.status(500).setHeader('content-type','application/json').send(JSON.stringify({status:'DEGRADED',error:e?.message||String(e)}));
  }
};
