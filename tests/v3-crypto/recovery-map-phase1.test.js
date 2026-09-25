import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../../web/v2/index.html',import.meta.url),'utf8');
const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const css=await readFile(new URL('../../web/v2/product-integration.css',import.meta.url),'utf8');
const sharedHeader=await readFile(new URL('../../src/ui/skrek-global-header.js',import.meta.url),'utf8');

test('P1-01 Recovery Map reuses the exact shared LEGAVIK Product Shell header',()=>{assert.match(html,/id="site-header" class="global-header-host"/);assert.match(app,/skrekGlobalHeader/);assert.match(sharedHeader,/return `<div class="nav-shell"/);assert.doesNotMatch(sharedHeader,/product-navigation|if\(mode==='map'\)return/);assert.match(sharedHeader,/我的恢复中心/);});
test('P1-02 shared Logo returns the current tab to LEGAVIK Home',()=>{assert.match(sharedHeader,/id="product-home-logo"[^>]+data-route="home"[^>]+href="\$\{href\('home'\)\}"/);assert.doesNotMatch(sharedHeader,/target="_blank"/);});
test('P1-03 0 of 6 shows only the Start primary CTA',()=>{assert.match(app,/complete\?`<div class="overview-secondary-actions"/);});
test('P1-04 Start CTA has an explicit premium primary style',()=>{assert.match(css,/dashboard-hero #next-task\{background:#fff/);});
test('P1-05 initial state hides Review and Report rather than disabling them',()=>{assert.match(app,/complete\?`<div class="overview-secondary-actions"/);assert.doesNotMatch(app,/id="report" \$\{complete===6/);});
test('P1-06 Before You Begin has journey and security hierarchy',()=>{assert.match(app,/开始前，先花一分钟/);assert.match(app,/请不要记录秘密/);});
test('P1-07 formal start enters Module 1',()=>{assert.match(app,/navTo\('accounts'\)/);});
test('P1-08 every module consumes the unified sticky action bar',()=>{assert.match(app,/function back\(\).*sticky-actions/);});
test('P1-09 modules expose one primary attachment entry in the module attachment zone',()=>{assert.equal((app.match(/id="module-attachments"/g)??[]).length,1);assert.match(app,/moduleAttachmentZone\(current\)/);assert.doesNotMatch(app,/data-quick-attachment data-/);});
test('P1-10 Module 4 risk note precedes the shared module attachment zone',()=>{const risk=app.indexOf('optional_risk_notes'),zone=app.indexOf("actions\?\.insertAdjacentHTML('beforebegin',moduleAttachmentZone(current))");assert.ok(risk>-1&&zone>risk);});
test('P1-11 Module 6 has no duplicate attachment button',()=>{const start=app.indexOf('function renderMessageV2');const end=app.indexOf('function renderAttachmentsV3');assert.doesNotMatch(app.slice(start,end),/data-quick-attachment|添加附件/);});
test('P1-12 attachment opens in a fixed drawer without changing background scroll',()=>{assert.match(app,/attachment-background-snapshot/);assert.match(css,/attachment-drawer-open main\[data-view="attachments"\]/);});
test('P1-13 attachment close restores the source context and exact scroll',()=>{assert.match(app,/window\.scrollTo\(\{top:attachmentReturnScroll,behavior:'auto'\}\)/);});
test('P1-14 ordinary transitions preserve position while completed cross-document hydration resets once',()=>{const navBody=app.slice(app.indexOf('function navTo('),app.indexOf('function show('));assert.doesNotMatch(navBody,/resetScroll:true/);assert.match(app,/stopHandshake\(\);render\(null,\{resetScroll:true\}\)/);});
test('P1-15 attachment navigation contains no smooth scroll or scrollIntoView',()=>{const start=app.indexOf('function openAttachmentCenter');const end=app.indexOf('function focus');assert.doesNotMatch(app.slice(start,end),/smooth|scrollIntoView/);});
test('P1-16 responsive shell and drawer prevent horizontal overflow',()=>{assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/width:100%/);});
