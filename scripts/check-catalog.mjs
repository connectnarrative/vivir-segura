import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('lib/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const exports={};vm.runInNewContext(code,{exports,require:()=>JSON.parse(fs.readFileSync('lib/media.json','utf8')),Intl,URL,encodeURIComponent});
const {properties,parseQuery,publicProperty,CONTACT,whatsapp,propertyMessage}=exports;
let count=0;function test(name,f){f();count++;console.log('PASS '+name)}
test('exactly three real properties',()=>assert.equal(properties.length,3));
test('verified contact',()=>{assert.equal(CONTACT.whatsapp,'14168254334');assert.equal(CONTACT.email,'alejandro@cartagena-connect.com')});
test('apartment asking price and administration',()=>{const p=properties[1];assert.equal(p.price,980000000);assert.equal(p.admin,1394000);assert.equal(p.area,170);assert.equal(p.beds,3);assert.equal(p.baths,3);assert.equal(p.parking,2)});
test('historic house specs and seller currency',()=>{const p=properties[2];assert.equal(p.price,3000000);assert.equal(p.currency,'USD');assert.equal(p.baths,12);assert.equal(p.beds,10);assert.equal(p.built,530);assert.equal(p.area,196)});
test('finca exact coordinates and requested price',()=>{assert.equal(properties[0].coords.join(','),'10.246295,-75.313232');assert.equal(properties[0].price,null)});
test('urban map privacy',()=>assert.ok(properties[1].approx&&properties[2].approx));
test('private fields stripped',()=>{const p=publicProperty({...properties[0],owner:'secret',internalNotes:'secret',commission:9});assert.ok(!('owner' in p)&&!('internalNotes' in p)&&!('commission' in p))});
test('natural apartment and neighborhood query',()=>{const p=parseQuery('Apartamento grande en Bocagrande');assert.equal(p.type,'Apartamento');assert.equal(p.location,'Bocagrande')});
test('natural finca and hectare query',()=>{const p=parseQuery('Finca de 1 hectárea cerca de Cartagena');assert.equal(p.type,'Finca');assert.equal(p.minArea,10000);assert.equal(p.location,'')});
test('natural land budget query',()=>{const p=parseQuery('Terreno de menos de $800 millones');assert.equal(p.type,'Tierra');assert.equal(p.max,800000000)});
test('property WhatsApp context',()=>{const s=decodeURIComponent(whatsapp(propertyMessage(properties[1])));assert.ok(s.includes('14168254334')&&s.includes('VS-002')&&s.includes('apartamento-170-bocagrande'))});
test('all curated media exists',()=>{for(const p of properties)for(const image of p.images)assert.ok(fs.existsSync('public'+image),image)});
console.log(`${count} catalog checks passed.`);
