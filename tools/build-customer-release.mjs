import {build} from 'esbuild';
import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const config=JSON.parse(await readFile(new URL('../config/customer-deployment.json',import.meta.url),'utf8'));
const id=config.deployment_identity;
const suffix=`.${id}`;
const root=new URL('../',import.meta.url);
const identityPattern=/legavik-[a-z0-9-]+-\d{8}-\d+/g;
const identitySources=['src/ui/canonical-customer-links.js','web/canonical-runtime-gate.js','web/account/canonical-entry.js','web/account/index.html','web/v2/canonical-entry.js','web/v2/index.html','web/canonical-entry-recovery.js','web/recover.html','web/v3-crypto/canonical-entry.js','web/v3-crypto/index.html'];
for(const path of identitySources){const url=new URL(path,root),source=await readFile(url,'utf8'),synced=source.replace(identityPattern,id);if(source!==synced)await writeFile(url,synced);}
const bundles=[
  ['web/v3-crypto/product-v1.js','web/v3-crypto/product-v1.bundle.js',{bundle:true,minify:true}],
  ['src/account/account-nav-bridge.js','web/account/account-nav-bridge.bundle.js',{bundle:true,minify:true}],
  ['src/account/supabase-account-app.js','web/account/account-app.bundle.js',{bundle:true,minify:true,format:'esm',platform:'browser'}],
  ['web/v2/v2-app.js','web/v2/v2-app.bundle.js',{bundle:true,minify:true,format:'esm',platform:'browser',external:['node:zlib']}],
  ['web/recover.js','web/recover.bundle.js',{bundle:true,minify:true}]
];
for(const[entry,outfile,options]of bundles)await build({...options,entryPoints:[new URL(entry,root).pathname],outfile:new URL(outfile,root).pathname});

const copies=[
  ['web/canonical-runtime-gate.js',`web/canonical-runtime-gate${suffix}.js`],
  ['web/canonical-entry-recovery.js',`web/canonical-entry-recovery${suffix}.js`],
  ['web/recover.bundle.js',`web/recover${suffix}.bundle.js`],
  ['web/styles.css',`web/styles${suffix}.css`],
  ['web/recovery-workspace.css',`web/recovery-workspace${suffix}.css`],
  ['web/account/canonical-entry.js',`web/account/canonical-entry${suffix}.js`],
  ['web/account/public-config.js',`web/account/public-config${suffix}.js`],
  ['web/account/account-nav-bridge.bundle.js',`web/account/account-nav-bridge${suffix}.bundle.js`],
  ['web/account/account-app.bundle.js',`web/account/account-app${suffix}.bundle.js`],
  ['web/account/account.css',`web/account/account${suffix}.css`],
  ['web/account/auth-ux.css',`web/account/auth-ux${suffix}.css`],
  ['artifacts/independent-recovery-tool-v1/LEGAVIK-Independent-Recovery-Tool-V1.html','web/account/LEGAVIK-Independent-Recovery-Tool-V1.html'],
  ['web/v2/canonical-entry.js',`web/v2/canonical-entry${suffix}.js`],
  ['web/v2/v2-app.bundle.js',`web/v2/v2-app${suffix}.bundle.js`],
  ['web/v2/v2.css',`web/v2/v2${suffix}.css`],
  ['web/v2/readiness.css',`web/v2/readiness${suffix}.css`],
  ['web/v2/product-integration.css',`web/v2/product-integration${suffix}.css`],
  ['web/v3-crypto/canonical-entry.js',`web/v3-crypto/canonical-entry${suffix}.js`],
  ['web/v3-crypto/product-v1.bundle.js',`web/v3-crypto/product-v1${suffix}.bundle.js`],
  ['web/v3-crypto/product-v1.css',`web/v3-crypto/product-v1${suffix}.css`],
  ['src/ui/skrek-global-header.css',`src/ui/skrek-global-header${suffix}.css`]
];
for(const[source,target]of copies)await copyFile(new URL(source,root),new URL(target,root));
const sha256=async path=>createHash('sha256').update(await readFile(new URL(path,root))).digest('hex');
const sourceCommit=process.env.LEGAVIK_SOURCE_COMMIT||execFileSync('git',['rev-parse','HEAD'],{cwd:new URL('.',root),encoding:'utf8'}).trim();
const html=['web/v3-crypto/index.html','web/account/index.html','web/v2/index.html','web/recover.html'];
const assets=[];
for(const[,path]of copies)assets.push({path,sha256:await sha256(path)});
const manifest={schema_version:1,deployment_identity:id,release:id,release_timestamp:config.release_timestamp,source_commit:sourceCommit,canonical_origin:config.canonical_origin,canonical_entry:`${config.canonical_origin}${config.canonical_base}/web/v3-crypto/index.html?release=${id}#home`,html:await Promise.all(html.map(async path=>({path,sha256:await sha256(path)}))),assets};
await writeFile(new URL('web/release-manifest.json',root),`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Built ${id}: ${assets.length} immutable assets`);
