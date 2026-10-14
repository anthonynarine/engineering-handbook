// scripts/serve-checks.mjs — Serve release files with configured headers for browser regression checks.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const headers=Object.fromEntries([...fs.readFileSync('netlify.toml','utf8').matchAll(/^    ([A-Za-z-]+) = "([^"]*)"$/gm)].map(([,key,value])=>[key,value]));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const fixture=pathname.startsWith('/__security/');const base=path.resolve(fixture?'.security-dist':'dist');const relative=fixture?pathname.slice('/__security/'.length):pathname.slice(1);let file=path.resolve(base,relative);
 if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(400);res.end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(base,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{...headers,'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:fs.readFileSync(file));
 }catch{res.writeHead(400);res.end();}});
server.listen(4173,'127.0.0.1',()=>console.log('Release-check server: http://127.0.0.1:4173'));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
