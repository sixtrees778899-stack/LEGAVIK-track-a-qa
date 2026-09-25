import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const identity='legavik-independent-recovery-tool-v1-20260912-1';
const outputDir='artifacts/independent-recovery-tool-v1';
const artifactName='LEGAVIK-Independent-Recovery-Tool-V1.html';
const result=await build({entryPoints:['src/independent-recovery-tool/v1-app.js'],bundle:true,format:'iife',platform:'browser',target:['es2020'],write:false,minify:true,treeShaking:true});
const javascript=result.outputFiles[0].text.replaceAll('</script>','<\\/script>');
const recoveryCss=await readFile('web/recovery-workspace.css','utf8');
const toolCss=`:root{--green:#064c3d;--cream:#faf8f2;--line:#d8e4de}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:#123e35;font-family:Arial,"PingFang SC",sans-serif}.shell{width:min(920px,calc(100% - 32px));margin:48px auto}.tool-intro{margin-bottom:24px}.eyebrow{letter-spacing:.16em;color:#687a74;font-size:.78rem;font-weight:700}.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:clamp(22px,4vw,40px);margin:18px 0}.field{display:grid;gap:8px;margin:18px 0}.field label{font-weight:700}.field input{width:100%;padding:14px;border:1px solid #b8c9c2;border-radius:10px}button{border:0;border-radius:10px;background:var(--green);color:#fff;padding:13px 20px;font-weight:700;cursor:pointer}button:disabled{opacity:.65}.error{color:#9b2c2c;margin-top:14px}.success{color:#075f48;margin-top:14px}.recovery-progress-card ol{list-style:none;padding:0}.recovery-progress-card li{display:flex;gap:12px;padding:10px 0;color:#788782}.recovery-progress-card li.active,.recovery-progress-card li.done{color:var(--green)}footer{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;padding:24px max(16px,calc((100% - 920px)/2));border-top:1px solid var(--line);color:#687a74;font-size:.8rem}`+recoveryCss;
const manifest={tool_name:'LEGAVIK Independent Recovery Tool',tool_version:'1.0.0',build_identity:identity,supported:{recovery_kit_version:[1],archive_version:[1],snapshot_version:[1],knowledge_map_schema_versions:[1,2]},dependencies:{account_login:false,supabase:false,supabase_auth:false,backend_api:false,server_secret:false,browser_web_crypto:true,arweave_gateway:true},customer_materials_embedded:false};
const template=await readFile('src/independent-recovery-tool/v1-template.html','utf8');
const html=template
  .replace('__INLINE_CSS__',()=>toolCss)
  .replace('__INLINE_MANIFEST__',()=>JSON.stringify(manifest).replaceAll('</script>','<\\/script>'))
  .replace('__INLINE_JAVASCRIPT__',()=>javascript);
await mkdir(outputDir,{recursive:true});
await writeFile(path.join(outputDir,artifactName),html);
const sha256=createHash('sha256').update(html).digest('hex');
await writeFile(path.join(outputDir,`${artifactName}.sha256`),`${sha256}  ${artifactName}\n`);
await writeFile(path.join(outputDir,'manifest.json'),JSON.stringify({...manifest,artifact:{filename:artifactName,sha256,media_type:'text/html'}},null,2)+'\n');
console.log(JSON.stringify({identity,artifact:path.join(outputDir,artifactName),sha256}));
