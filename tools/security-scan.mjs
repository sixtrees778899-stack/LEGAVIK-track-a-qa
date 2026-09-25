import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const findings=[];
// Scan authored sources. Browser bundles contain the audited Supabase SDK, whose
// documented examples and session implementation legitimately reference
// storage, logging and telemetry terms; scanning that vendored output creates
// findings that cannot be acted on in this repository.
const files=[...(await walk('src')),...(await walk('web'))].filter(f=>f.endsWith('.js')&&!f.endsWith('.bundle.js'));
for(const file of files){const text=await readFile(file,'utf8');for(const [rule,re] of Object.entries({browser_persistence:/\b(localStorage|sessionStorage|indexedDB)\b/i,console_logging:/\bconsole\s*\./,wallet_or_mainnet:/\b(arconnect|wander|window\.arweaveWallet|transactions\.post)\b/i,telemetry:/\b(sendBeacon|analytics|telemetry)\b/i})){if(re.test(text))findings.push({file,rule});}}
process.stdout.write(`${JSON.stringify({status:findings.length?'FAIL':'PASS',files_scanned:files.length,findings},null,2)}\n`);if(findings.length)process.exitCode=1;
