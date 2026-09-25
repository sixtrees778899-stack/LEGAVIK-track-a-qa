import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=new URL('../../web/v3-crypto/',import.meta.url);
const [app,css]=await Promise.all([
  readFile(new URL('product-v1.js',base),'utf8'),
  readFile(new URL('product-v1.css',base),'utf8')
]);

test('digital assets navigation renders the dedicated guide instead of a generic page',()=>{
  assert.match(app,/state\.route==='digital-assets'\)digitalAssetsGuide\(\)/);
  assert.match(app,/function digitalAssetsGuide\(\)/);
  assert.doesNotMatch(app,/\['digital-assets','security','recovery'/);
});

test('approved digital-assets copy and six categories are present without product expansion',()=>{
  for(const phrase of [
    '你的数字资产，','LEGAVIK 首先帮助你做的是，重新梳理一次自己的数字资产。',
    '加密资产','数字身份与重要账户','数字创作与内容资产','知识产权与技术资产','商业与专业数字资产','个人数字资料与记忆',
    '在从容时准备，在关键时使用，','先梳理，再建立 Recovery Map',
    '保存的是恢复线索，','LEGAVIK 不是数字资产云存储平台',
    '开始梳理我的数字资产','了解 Recovery Map'
  ])assert.match(app,new RegExp(phrase));
  assert.equal((app.match(/\['0[1-6]','/g)??[]).length,6);
});

test('page remains in the established LEGAVIK visual system and is responsive',()=>{
  for(const token of ['.assets-guide','.assets-intro','.assets-category-grid','.assets-pause','.assets-map-logic','.assets-boundary','.assets-cta'])assert.match(css,new RegExp(token.replace('.','\\.')));
  assert.match(css,/background:var\(--paper\)/);
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.doesNotMatch(css,/blue|purple/i);
});
