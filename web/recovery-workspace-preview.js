import {renderRecoveryMap} from './map-view.js';
import {getRecoveryWorkspacePreviewFixture} from './recovery-workspace-preview-fixtures.js';

const params=new URLSearchParams(location.search),internalHost=['localhost','127.0.0.1'].includes(location.hostname),internalFlag=params.get('internal_preview')==='1',fixtureName=params.get('fixture')==='boundary'?'boundary':'complete',app=document.querySelector('#app');
if(!internalHost||!internalFlag){app.innerHTML='<section class="card"><h1>Preview unavailable</h1><p>此内部预览入口仅在本地验收环境开放。</p></section>';throw new Error('INTERNAL_PREVIEW_UNAVAILABLE');}
document.querySelector('[data-preview-name]').textContent=fixtureName==='boundary'?'BOUNDARY STATE':'COMPLETE DATA';
renderRecoveryMap(app,getRecoveryWorkspacePreviewFixture(fixtureName));
for(const button of app.querySelectorAll('[data-attachment-id]')){button.disabled=true;button.title=`${button.textContent}仅模拟正式产品界面；Preview Fixture 不包含真实附件字节`;}
