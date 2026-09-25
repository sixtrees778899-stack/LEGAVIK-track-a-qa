import {spawn} from 'node:child_process';
import {execFile} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const expectedRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const serviceName='cjas-mainnet-test-server';
const createPath='/web/v2/index.html?test_recovery_map=1&mainnet_experience_test=1&release=recovery-delivery-hardened-v1';
const recoveryPath='/web/recover.html?source=recovery-center&release=recovery-delivery-hardened-v1';
const criticalPaths=['/web/v2/index.html','/web/recover.html','/web/v2/v2-app.js','/web/recover.js','/src/ui/recovery-route.js'];

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const baseUrl=port=>`http://127.0.0.1:${port}`;
const execFileAsync=promisify(execFile);

async function response(url){
  return fetch(url,{cache:'no-store',signal:AbortSignal.timeout(2500)});
}

export async function portIsOpen(port){
  return new Promise(resolve=>{
    const socket=net.connect({host:'127.0.0.1',port});
    socket.once('connect',()=>{socket.destroy();resolve(true);});
    socket.once('error',()=>resolve(false));
    socket.setTimeout(1000,()=>{socket.destroy();resolve(false);});
  });
}

export async function inspectServer(port){
  try{
    const result=await response(`${baseUrl(port)}/__cjas_health`);
    if(!result.ok)return {valid:false,reason:`health returned ${result.status}`};
    const health=await result.json();
    const valid=health.service===serviceName&&path.resolve(health.root)===expectedRoot&&health.recovery_path==='/web/recover.html';
    return {valid,health,reason:valid?'':`unexpected server identity on port ${port}`};
  }catch(error){
    return {valid:false,reason:error.message};
  }
}

async function inspectLegacyExpectedProcess(port){
  try{
    const {stdout:pidOutput}=await execFileAsync('lsof',['-tiTCP:'+port,'-sTCP:LISTEN']);
    const pid=Number(pidOutput.trim().split(/\s+/)[0]);
    if(!pid)return {valid:false,reason:'listener PID unavailable'};
    const [{stdout:cwdOutput},{stdout:processOutput}]=await Promise.all([
      execFileAsync('lsof',['-a','-p',String(pid),'-d','cwd','-Fn']),
      execFileAsync('ps',['-o','command=','-p',String(pid)])
    ]);
    const cwd=cwdOutput.split('\n').find(line=>line.startsWith('n'))?.slice(1);
    const command=processOutput.trim();
    const valid=path.resolve(cwd??'/')===expectedRoot&&/(^|\s)node\s+tools\/static-server\.mjs(?:\s|$)/.test(command);
    return {valid,pid,cwd,command,reason:valid?'':`listener does not match ${expectedRoot}/tools/static-server.mjs`};
  }catch(error){
    return {valid:false,reason:error.message};
  }
}

export async function startExpectedServer({port,detached=false}={}){
  const child=spawn(process.execPath,['tools/static-server.mjs'],{
    cwd:expectedRoot,
    env:{...process.env,CJAS_PORT:String(port)},
    detached,
    stdio:detached?'ignore':['ignore','pipe','pipe']
  });
  if(detached)child.unref();
  return child;
}

export async function ensureTestServer({port=Number(process.env.CJAS_PORT||8080),detached=false}={}){
  if(await portIsOpen(port)){
    let identity=await inspectServer(port);
    if(!identity.valid){
      const legacyIdentity=await inspectLegacyExpectedProcess(port);
      if(!legacyIdentity.valid)throw new Error(`端口 ${port} 已被非预期服务占用：${identity.reason}; ${legacyIdentity.reason}`);
      identity={valid:true,health:{service:serviceName,root:expectedRoot,pid:legacyIdentity.pid,recovery_path:'/web/recover.html',identity_source:'verified-process'}};
    }
    return {port,reused:true,child:null,health:identity.health};
  }
  const child=await startExpectedServer({port,detached});
  for(let attempt=0;attempt<40;attempt+=1){
    await delay(100);
    const identity=await inspectServer(port);
    if(identity.valid)return {port,reused:false,child,health:identity.health};
    if(child.exitCode!==null)throw new Error(`SKREK 测试服务启动失败，退出码 ${child.exitCode}`);
  }
  child.kill?.();
  throw new Error('SKREK 测试服务未能在预期时间内就绪。');
}

export async function verifyHttpResources(port){
  for(const resource of criticalPaths){
    const result=await response(`${baseUrl(port)}${resource}`);
    if(!result.ok)throw new Error(`${resource} 返回 ${result.status}`);
  }
  return true;
}

export async function verifyRenderedPages(port){
  const {chromium}=await import('@playwright/test');
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage();
    await page.goto(`${baseUrl(port)}${recoveryPath}`,{waitUntil:'networkidle'});
    await page.locator('#evidence').waitFor();
    await page.locator('#kit').waitFor();
    await page.locator('#recover').waitFor();
    await page.goto(`${baseUrl(port)}${createPath}`,{waitUntil:'networkidle'});
    await page.getByText('MODULE 1 OF 6').waitFor();
  }finally{
    await browser.close();
  }
  return true;
}

export async function launchTestEnvironment({port=Number(process.env.CJAS_PORT||8080),openBrowser=true}={}){
  if(process.cwd()!==expectedRoot)throw new Error(`请从预期项目目录启动：${expectedRoot}`);
  const server=await ensureTestServer({port,detached:true});
  await verifyHttpResources(port);
  await verifyRenderedPages(port);
  const createUrl=`${baseUrl(port)}${createPath}`;
  const recoveryUrl=`${baseUrl(port)}${recoveryPath}`;
  if(openBrowser)spawn('open',[createUrl],{detached:true,stdio:'ignore'}).unref();
  return {...server,createUrl,recoveryUrl};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const openBrowser=!process.argv.includes('--no-open');
  launchTestEnvironment({openBrowser}).then(result=>{
    process.stdout.write(`SERVER READY\nCREATE ${result.createUrl}\nRECOVERY ${result.recoveryUrl}\n`);
  }).catch(error=>{
    process.stderr.write(`NOT READY\n${error.message}\n`);
    process.exitCode=1;
  });
}
