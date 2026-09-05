import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const market = await import(`file://${path.join(root,'netlify/functions/market-data.js')}`);
const catalyst = await import(`file://${path.join(root,'netlify/functions/catalyst-feed.js')}`);
const runtime = await import(`file://${path.join(root,'netlify/functions/v730-runtime.js')}`);
async function invoke(fn){ const r=await fn({httpMethod:'GET',headers:{},body:null}); return JSON.parse(r.body||'{}'); }
async function readJson(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return null;}}
async function writeJson(file,obj){await fs.writeFile(file,JSON.stringify(obj,null,2)+'\n');}
const dir=path.join(root,'data'); await fs.mkdir(dir,{recursive:true});
const files={market:path.join(dir,'market-data.json'),catalyst:path.join(dir,'catalyst-feed.json'),runtime:path.join(dir,'v730-runtime.json')};
const [md,cd,rd]=await Promise.all([invoke(market.handler),invoke(catalyst.handler),invoke(runtime.handler)]);
const oldM=await readJson(files.market), oldC=await readJson(files.catalyst), oldR=await readJson(files.runtime);
const goodM=Number(md.validCount||0)>0; const goodC=Number(cd.summary?.count||0)>0; const goodR=rd.status==='INTEGRATED';
if(goodM) await writeJson(files.market,md); else if(!oldM) await writeJson(files.market,{statusCode:200,validCount:0,total:3,marketSession:'CLOSED',data:{},errors:['No validated market snapshot available'],generatedAt:new Date().toISOString()});
if(goodC) await writeJson(files.catalyst,cd); else if(!oldC) await writeJson(files.catalyst,{statusCode:200,items:[],summary:{count:0,bullish:0,bearish:0,neutral:0,avgCatalystScore:0,catalystBias:'NEUTRAL',catalystConfidence:0,catalystRisk:100,catalystHealth:0,catalystFreshness:0},error:'No validated catalyst snapshot available'});
if(goodR) await writeJson(files.runtime,rd); else if(!oldR) await writeJson(files.runtime,{status:'DEGRADED',version:'V730000-RECOVERY',generatedAt:new Date().toISOString(),results:[],error:'No validated integrated runtime snapshot available'});
console.log(JSON.stringify({generatedAt:new Date().toISOString(),marketValid:md.validCount||0,catalysts:cd.summary?.count||0,runtime:rd.status,marketUpdated:goodM,catalystUpdated:goodC,runtimeUpdated:goodR}));
