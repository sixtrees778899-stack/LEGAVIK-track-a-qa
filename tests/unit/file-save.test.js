import test from 'node:test';
import assert from 'node:assert/strict';
import { saveBytesLocally } from '../../src/ui/file-save.js';

const bytes = Uint8Array.from([0,1,2,3,255]);

test('file picker writes real bytes and only reports saved after close', async () => {
  const events=[];
  const picker=async options=>{events.push(['picker',options.suggestedName]);return{createWritable:async()=>({write:async blob=>events.push(['write',new Uint8Array(await blob.arrayBuffer()),blob.type]),close:async()=>events.push(['close'])})};};
  const result=await saveBytesLocally({bytes,suggestedName:'恢复资料.bin',mimeType:'application/octet-stream',picker});
  assert.equal(result.status,'saved');assert.deepEqual(events[1][1],bytes);assert.equal(events[1][2],'application/octet-stream');assert.deepEqual(events[2],['close']);
});

test('file picker cancellation is not reported as completed and does not fall back', async () => {
  let created=false;const error=new Error('cancelled');error.name='AbortError';
  const result=await saveBytesLocally({bytes,suggestedName:'cancel.bin',mimeType:'application/octet-stream',picker:async()=>{throw error;},documentRef:{createElement(){created=true;}}});
  assert.equal(result.status,'cancelled');assert.equal(created,false);
});

test('Safari-style fallback clicks a temporary download and revokes its ObjectURL', async () => {
  const events=[];const link={style:{},click(){events.push('click');},remove(){events.push('remove');}};
  const result=await saveBytesLocally({bytes,suggestedName:'safe.bin',mimeType:'application/octet-stream',picker:undefined,documentRef:{createElement:()=>link,body:{append:()=>events.push('append')}},urlApi:{createObjectURL:blob=>{events.push(['create',blob.type]);return'blob:test';},revokeObjectURL:url=>events.push(['revoke',url])},schedule:callback=>callback()});
  assert.equal(result.status,'download-started');assert.deepEqual(events,[['create','application/octet-stream'],'append','click','remove',['revoke','blob:test']]);
});
