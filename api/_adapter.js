'use strict';
function adapt(fn){
  return async function handler(req,res){
    try{
      const event={
        httpMethod:req.method,
        headers:req.headers||{},
        query:req.query||{},
        body:req.body,
        path:req.url
      };
      const out=await fn(event);
      const status=Number(out?.statusCode)||200;
      if(out?.headers) for(const [k,v] of Object.entries(out.headers)) res.setHeader(k,v);
      let body=out?.body;
      if(body===undefined) body='';
      if(typeof body==='string'){
        try{ body=JSON.parse(body); }catch(_){ /* plain text */ }
      }
      return res.status(status).send(body);
    }catch(err){
      return res.status(500).json({error:'API handler failure',message:err?.message||String(err)});
    }
  };
}
module.exports={adapt};
