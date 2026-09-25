import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const templates=JSON.parse(await readFile(new URL('config/recovery-map/v2/platform-templates-v2.json',root),'utf8'));

test('Module 1 exposes exactly four customer categories with category-local custom entries',()=>{
  assert.match(source,/const catalogGroups=\[\['CEX','中心化交易所'\],\['DEX','去中心化交易所'\],\['HOT_WALLET','热钱包 \/ 软件钱包'\],\['HARDWARE_WALLET','冷钱包 \/ 硬件钱包'\]\]/);
  assert.doesNotMatch(source,/const catalogGroups=.*\['MULTISIG'/);
  for(const id of ['custom_cex','custom_dex','custom_hot_wallet','custom_hardware_wallet'])assert.ok(templates.platforms.some(item=>item.id===id));
});

test('all requested platform families use canonical templates and only CEX requires account metadata',()=>{
  for(const id of ['binance','okx','hyperliquid','uniswap','metamask','imtoken','wander','ledger','coldlar','keystone'])assert.ok(templates.platforms.some(item=>item.id===id),id);
  for(const item of templates.platforms.filter(item=>['DEX','HOT_WALLET','HARDWARE_WALLET'].includes(item.category))){assert.equal(item.requires_region,false,item.id);assert.equal(item.requires_account_type,false,item.id);}
  assert.equal(templates.platforms.find(item=>item.id==='custom_cex').requires_region,true);
});

test('the sticky action bar owns the single attachment entry and canonical preflight blocks navigation',()=>{
  assert.match(source,/attachmentAction=.*id="module-attachments"/);
  assert.match(source,/function validateCurrentModuleBeforeContinue\(\)/);
  assert.match(source,/receipt\.validation_issues\.filter\(item=>item\.module_id===current&&item\.blocking\)/);
  assert.match(source,/if\(!validateCurrentModuleBeforeContinue\(\)\)return/);
});
