import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';
const code=ts.transpileModule(fs.readFileSync('lib/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const exports={};vm.runInNewContext(code,{exports,require:()=>JSON.parse(fs.readFileSync('lib/media.json','utf8')),Intl,URL,encodeURIComponent});
const rows=exports.properties.map(p=>({reference:p.id,slug:p.slug,status:p.status,public_data:exports.publicProperty(p)}));
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
fs.writeFileSync('supabase/seed.sql',rows.map(r=>`insert into public.properties(reference,slug,status,public_data) values(${quote(r.reference)},${quote(r.slug)},${quote(r.status)},${quote(JSON.stringify(r.public_data))}::jsonb) on conflict(reference) do nothing;`).join('\n'));
console.log('Prepared '+rows.length+' real catalog records.');
