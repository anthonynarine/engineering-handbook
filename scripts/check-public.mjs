// scripts/check-public.mjs — Scan only the reviewed source allowlist or the deployable artifact.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {findings} from './lib/public-scan.mjs';
export const sourceRoots=['src','content','reference_sources','scripts','tests','docs','.github','public'];
const rootFiles=['.gitignore','AGENTS.md','CLAUDE.md','README.md','index.html','netlify.toml','package.json','package-lock.json','tsconfig.json','vite.config.ts'];
const roots=process.argv.includes('--dist')?['dist']:[...sourceRoots,...rootFiles];
let count=0;const failures=[];
function scanFile(file){count++;if(/\.(?:[cm]?[jt]sx?|json|html|css|md|ya?ml|toml|txt)$/.test(file))for(const kind of findings(fs.readFileSync(file,'utf8')))failures.push(`${file}: ${kind}`);}
function walk(base){if(!fs.existsSync(base))return;if(fs.statSync(base).isFile()){scanFile(base);return;}for(const entry of fs.readdirSync(base,{withFileTypes:true})){
 const file=path.join(base,entry.name);if(entry.isSymbolicLink()){failures.push(`${file}: symlink not allowed`);continue;}if(entry.isDirectory()){walk(file);continue;}scanFile(file);
 if(/(?:^|\/)(?:\.env(?:\..*)?|\.git|\.foundry|\.private|node_modules)(?:\/|$)/.test(file)||/\.(?:pem|key|sqlite3|map)$/.test(file))failures.push(`${file}: restricted artifact`);

}}
for(const root of roots)walk(root);
if(!process.argv.includes('--dist')){
 const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
 for(const file of tracked)if(!rootFiles.includes(file)&&!sourceRoots.some(root=>file.startsWith(root+'/')))failures.push(`${file}: outside reviewed source allowlist`);
}
if(process.argv.includes('--dist')){
 const files=fs.readdirSync('dist');for(const name of files)if(!['index.html','assets','release.json'].includes(name))failures.push(`dist/${name}: unexpected deploy root`);
 if(!fs.existsSync('dist/release.json'))failures.push('dist: missing release revision');
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log(`Public-safety scan passed (${count} files); pattern checks do not replace editorial review.`);
