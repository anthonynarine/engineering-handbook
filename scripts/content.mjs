// scripts/content.mjs — Validate local Markdown and generate the shared content registry.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
const files = fs.readdirSync('content', {recursive:true}).filter(f=>f.endsWith('.md'));
const articles=files.map(file=>{
 const raw=fs.readFileSync(path.join('content',file),'utf8').replace(/^<!--[^]*?-->\s*/, '');
 const match=raw.match(/^---\r?\n([^]*?)\r?\n---\r?\n([^]*)$/);
 if(!match) throw Error(`${file}: missing frontmatter`);
 const data=parse(match[1]); const content=match[2];
 for(const field of ['title','slug','section','summary','order','tags','status','lastReviewed','sources','related']) if(data[field]===undefined) throw Error(`${file}: missing ${field}`);
 if(!/^[a-z0-9-]+$/.test(data.slug)) throw Error(`${file}: invalid slug`);
 if(!['established-pattern','proposed-design','verified-implementation'].includes(data.status)) throw Error(`${file}: invalid status`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(data.lastReviewed) || Number.isNaN(Date.parse(data.lastReviewed))) throw Error(`${file}: invalid review date`);
 if(!Number.isFinite(data.order)||!['tags','sources','related'].every(k=>Array.isArray(data[k])&&data[k].every(v=>typeof v==='string'))) throw Error(`${file}: invalid metadata types`);
 for(const source of data.sources) if(!fs.existsSync(source)) throw Error(`${file}: missing source ${source}`);
 return {...data,body:content,file};
}).sort((a,b)=>a.order-b.order);
const slugs=new Set();
for(const a of articles){if(slugs.has(a.slug))throw Error(`Duplicate slug ${a.slug}`);slugs.add(a.slug);}
for(const a of articles){for(const related of a.related)if(!slugs.has(related))throw Error(`Broken related link ${related}`);for(const match of a.body.matchAll(/\]\(\/guide\/([^)#]+)(?:#[^)]*)?\)/g))if(!slugs.has(match[1]))throw Error(`Broken article link ${match[1]}`);}
fs.mkdirSync('src/generated',{recursive:true});fs.writeFileSync('src/generated/articles.json',JSON.stringify(articles,null,2)+'\n');
console.log(`Validated ${articles.length} articles; generated navigation and search source.`);
