// Bundle the actual brain into one offline HTML artwork, without a server or CDN.
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const result=await build({configFile:false,publicDir:false,plugins:[react()],define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{write:false,minify:true,sourcemap:false,cssCodeSplit:false,lib:{entry:path.resolve('src/art/brain.tsx'),name:'BrainArtwork',formats:['iife']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const outputs=(Array.isArray(result)?result:[result]).flatMap(bundle=>bundle.output);
const script=outputs.filter(item=>item.type==='chunk').map(item=>item.code).join('\n').replace(/<\/script/gi,'<\\/script');
const css=outputs.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>String(item.source)).join('\n');
if(!script||!css)throw Error('Artwork bundle is incomplete');
const hash=createHash('sha256').update(script).digest('base64');
const html=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>The brain — Anthony Narine</title><meta name="description" content="An interactive artwork: a living constellation of connected engineering ideas. By Anthony Narine."><style>${css.replace(/<\/style/gi,'<\\/style')}</style></head><body><div id="root"></div><noscript>This artwork needs JavaScript for its interactive brain.</noscript><script>${script}</script></body></html>\n`;
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/the-brain.html',html);
console.log(`Created artifacts/the-brain.html (${Math.round(Buffer.byteLength(html)/1024)} KB). Open directly in a browser; no network or server required.`);
