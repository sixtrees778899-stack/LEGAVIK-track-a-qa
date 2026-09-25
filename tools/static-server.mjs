import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const port=Number(process.env.CJAS_PORT||8080);
const types={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.pdf':'application/pdf'
};
const securityHeaders={
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self'; img-src 'self' blob:; object-src 'none'; base-uri 'none'; connect-src 'self' https://kkpipnlvercivdykflet.supabase.co https://arweave.net https://*.arweave.net https://ardrive.net https://*.ardrive.net"
};

const server=http.createServer(async(req,res)=>{
  res.on('error',()=>{});
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/__cjas_health'){
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8',...securityHeaders});
      res.end(JSON.stringify({service:'cjas-mainnet-test-server',root,pid:process.pid,recovery_path:'/web/recover.html'}));
      return;
    }
    if(url.pathname==='/'){
      res.writeHead(302,{Location:'/web/index.html'});
      res.end();
      return;
    }
    const requested=decodeURIComponent(url.pathname);
    let file=path.resolve(root,`.${requested}`);
    if(!file.startsWith(`${root}${path.sep}`))throw new Error('Invalid path');
    const fileStat=await stat(file);
    if(fileStat.isDirectory())file=path.join(file,'index.html');
    if(!(await stat(file)).isFile())throw new Error('Not found');
    res.writeHead(200,{
      'Content-Type':types[path.extname(file)]||'application/octet-stream',
      ...securityHeaders
    });
    res.end(await readFile(file));
  }catch{
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
});
server.on('clientError',(_error,socket)=>{
  if(socket.writable)socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(port,'127.0.0.1',()=>{
  process.stdout.write(`CJAS Vault local server: http://127.0.0.1:${port}/\n`);
});
