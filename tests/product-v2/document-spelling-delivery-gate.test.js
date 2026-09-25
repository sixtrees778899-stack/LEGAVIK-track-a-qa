import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inflateRawSync} from 'node:zlib';
import {createDynamicDocxTemplate} from '../../src/product-v2/dynamic-docx-templates.js';

const root=new URL('../../',import.meta.url);
const td=new TextDecoder();
function entries(bytes){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=bytes.length-22;
  while(end>=0&&view.getUint32(end,true)!==0x06054b50)end--;
  assert.ok(end>=0,'DOCX central directory');
  let offset=view.getUint32(end+16,true);const out={};
  for(let i=0,count=view.getUint16(end+10,true);i<count;i++){
    const method=view.getUint16(offset+10,true),size=view.getUint32(offset+20,true),nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true),name=td.decode(bytes.slice(offset+46,offset+46+nameLength)),localName=view.getUint16(local+26,true),localExtra=view.getUint16(local+28,true),raw=bytes.slice(local+30+localName+localExtra,local+30+localName+localExtra+size);
    out[name]=method===0?raw:new Uint8Array(inflateRawSync(raw));offset+=46+nameLength+extraLength+commentLength;
  }
  return out;
}
const runText=run=>run.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
const proofingText=value=>runText(value).replace(/\u2060/g,'');
function assertLegavikNoProof(bytes,label){
  let occurrences=0;
  for(const[name,data]of Object.entries(entries(bytes))){
    if(!name.startsWith('word/')||!name.endsWith('.xml'))continue;
    const xml=td.decode(data);
    for(const run of xml.match(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/gi)??[]){
      if(!/LEGAVIK/i.test(proofingText(run)))continue;
      occurrences+=(proofingText(run).match(/LEGAVIK/gi)??[]).length;
      assert.match(run,/<w:noProof\s*\/>/i,`${label} ${name} must suppress proofing for LEGAVIK`);
    }
    for(const paragraph of xml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/gi)??[]){
      if(/LEGAVIK/i.test(proofingText(paragraph)))assert.doesNotMatch(paragraph,/<w:proofErr\b/i,`${label} ${name} must not retain proof errors around LEGAVIK`);
    }
  }
  assert.ok(occurrences>0,`${label} contains LEGAVIK`);
  return occurrences;
}
function assertTemplateHeaderBrandContract(bytes,label){
  const files=entries(bytes);let headerCount=0,brandHeaderCount=0;
  for(const[name,data]of Object.entries(files)){
    if(!/^word\/header\d+\.xml$/i.test(name))continue;
    headerCount+=1;const xml=td.decode(data),visible=proofingText(xml);
    if(/LEGAVIK · Recovery Map/.test(visible))brandHeaderCount+=1;
    assert.doesNotMatch(xml,/<(?:w:drawing|w:pict)\b/i,`${label} ${name} must not contain graphic branding`);
  }
  assert.ok(headerCount>0,`${label} contains at least one page header`);
  const documentVisible=proofingText(td.decode(files['word/document.xml']));
  assert.ok(brandHeaderCount>0||/LEGAVIK · Recovery Map/.test(documentVisible),`${label} must retain exactly one customer-visible text brand line`);
  assert.equal(Object.keys(files).filter(name=>name.startsWith('word/media/')).length,0,`${label} must not package logo media`);
}

test('all 23 static customer DOCX files suppress Word proofing for LEGAVIK',async()=>{
  const handbook=['Module1_资产与账户_汇总文档','Module2_恢复所需条件与资料_汇总文档','Module3_位置与查找_单一平台填写模板','Module3_位置与查找_汇总填写模板','Module4_恢复与转移步骤_单一平台填写模板','Module4_恢复与转移步骤_汇总填写模板','Module5_协助人_填写模板','Module6_给未来恢复人的嘱托_填写模板'].map(name=>`artifacts/handbook-v1/LEGAVIK_${name}_Handbook_V1.docx`);
  const runtime=['Module1_资产与账户_Canonical_V2','Module2_恢复所需条件与资料_Canonical_V2','Module3_位置与查找_单一平台信息_Canonical_V2','Module3_位置与查找_单一平台填写模板_V3_Final','Module3_位置与查找_恢复信息位置汇总_Canonical_V2','Module3_位置与查找_汇总填写模板_Clean_Formal_V1','Module4_恢复与转移步骤_单一平台填写模板_V1_Final','Module4_恢复与转移步骤_单一平台恢复步骤_Canonical_V2.1','Module4_恢复与转移步骤_单一平台恢复步骤_Canonical_V2','Module4_恢复与转移步骤_恢复步骤汇总_Canonical_V2.1','Module4_恢复与转移步骤_恢复步骤汇总_Canonical_V2','Module4_恢复与转移步骤_汇总填写模板_Clean_Formal_V1','Module5_协助人_Canonical_V2','Module6_给未来恢复人的嘱托_Canonical_V2','Module6_给未来恢复人的嘱托_Canonical_V3.1'].map(name=>`web/v2/assets/templates/LEGAVIK_${name}.docx`);
  let total=0;for(const path of [...handbook,...runtime])total+=assertLegavikNoProof(new Uint8Array(await readFile(new URL(path,root))),path);
  assert.equal(total,160);
});

test('runtime-generated DOCX reapplies the brand proofing contract after document reconstruction',async()=>{
  const canonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module1_资产与账户_Canonical_V2.docx',root)));
  const generated=await createDynamicDocxTemplate({accounts:[{account_id:'account-a',platform_or_wallet:'LEGAVIK Test Account',category:'中心化交易所',region:'',account_type:''}]},{moduleId:'accounts',canonicalBytes});
  assert.match(generated.filename,/\.docx$/);assertLegavikNoProof(generated.bytes,'runtime output');
});

test('all 23 Module 1–6 templates use only the LEGAVIK text header',async()=>{
  const handbook=['Module1_资产与账户_汇总文档','Module2_恢复所需条件与资料_汇总文档','Module3_位置与查找_单一平台填写模板','Module3_位置与查找_汇总填写模板','Module4_恢复与转移步骤_单一平台填写模板','Module4_恢复与转移步骤_汇总填写模板','Module5_协助人_填写模板','Module6_给未来恢复人的嘱托_填写模板'].map(name=>`artifacts/handbook-v1/LEGAVIK_${name}_Handbook_V1.docx`);
  const runtime=['Module1_资产与账户_Canonical_V2','Module2_恢复所需条件与资料_Canonical_V2','Module3_位置与查找_单一平台信息_Canonical_V2','Module3_位置与查找_单一平台填写模板_V3_Final','Module3_位置与查找_恢复信息位置汇总_Canonical_V2','Module3_位置与查找_汇总填写模板_Clean_Formal_V1','Module4_恢复与转移步骤_单一平台填写模板_V1_Final','Module4_恢复与转移步骤_单一平台恢复步骤_Canonical_V2.1','Module4_恢复与转移步骤_单一平台恢复步骤_Canonical_V2','Module4_恢复与转移步骤_恢复步骤汇总_Canonical_V2.1','Module4_恢复与转移步骤_恢复步骤汇总_Canonical_V2','Module4_恢复与转移步骤_汇总填写模板_Clean_Formal_V1','Module5_协助人_Canonical_V2','Module6_给未来恢复人的嘱托_Canonical_V2','Module6_给未来恢复人的嘱托_Canonical_V3.1'].map(name=>`web/v2/assets/templates/LEGAVIK_${name}.docx`);
  for(const path of [...handbook,...runtime])assertTemplateHeaderBrandContract(new Uint8Array(await readFile(new URL(path,root))),path);
});

test('runtime-generated DOCX preserves the text-only header and never reintroduces logo media',async()=>{
  const canonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module1_资产与账户_Canonical_V2.docx',root)));
  const generated=await createDynamicDocxTemplate({accounts:[{account_id:'account-a',platform_or_wallet:'LEGAVIK Test Account',category:'中心化交易所',region:'',account_type:''}]},{moduleId:'accounts',canonicalBytes});
  assertTemplateHeaderBrandContract(generated.bytes,'runtime output');
});
