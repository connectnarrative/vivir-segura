import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
function load(path,backend){const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};vm.runInNewContext(code,{exports,require:()=>backend,Response,Request,console,process});return exports}
const backend={configured:()=>false,sameOrigin:()=>true,isAdmin:async()=>false};
let n=0;async function check(name,path,method,req,status){const route=load(path,backend);const r=await route[method](req);assert.equal(r.status,status);n++;console.log('PASS '+name)}
await check('anonymous admin reads denied','app/api/admin/route.ts','GET',new Request('https://example.com/api/admin'),403);
await check('anonymous admin writes denied','app/api/admin/route.ts','POST',new Request('https://example.com/api/admin',{method:'POST',body:'{}'}),403);
await check('unconfigured form reports unavailable, never success','app/api/leads/route.ts','POST',new Request('https://example.com/api/leads',{method:'POST',body:'{}'}),503);
backend.configured=()=>true;backend.rest=async()=>[];
await check('invalid lead rejected','app/api/leads/route.ts','POST',new Request('https://example.com/api/leads',{method:'POST',body:JSON.stringify({kind:'consulta',name:'A',phone:'123',consent:false})}),400);
backend.sameOrigin=()=>false;
await check('cross-origin writes rejected','app/api/leads/route.ts','POST',new Request('https://example.com/api/leads',{method:'POST',body:'{}'}),403);
console.log(`${n} endpoint checks passed.`);
