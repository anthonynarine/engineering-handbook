// Check the deployed revision, policy, assets and rendered routes without modifying user data.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium,expect} from '@playwright/test';
import {browserOptions} from '../tests/browser-options.mjs';

const base=new URL(process.argv[2]??'https://anthony-narine-engineering-handbook.netlify.app');
assert.ok(base.protocol==='https:'||(base.protocol==='http:'&&base.hostname==='127.0.0.1'),'HTTPS or local check server required');
const revision=process.argv[3]??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const expectedHeaders=Object.fromEntries([...fs.readFileSync('netlify.toml','utf8').matchAll(/^    ([A-Za-z-]+) = "([^"]*)"$/gm)].map(([,key,value])=>[key.toLowerCase(),value]));
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage();const errors=[];const external=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>errors.push(`Request failed: ${new URL(request.url()).pathname}`));
 page.on('response',response=>{if(response.status()>=400)errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);});
 page.on('request',request=>{if(new URL(request.url()).origin!==base.origin)external.push(request.url());});
 const response=await page.request.get(new URL('/release.json',base).href,{headers:{'Cache-Control':'no-cache'}});
 assert.equal(response.status(),200);assert.equal((await response.json()).revision,revision,'Production revision differs from verified candidate');
 for(const route of ['/','/guide/build-manual','/guide/lumen-aws-architecture']){
  const result=await page.goto(new URL(route,base).href);assert.equal(result.status(),200,route);
  for(const [header,value] of Object.entries(expectedHeaders))assert.equal(result.headers()[header],value,`${route}: ${header}`);
  if(base.protocol==='https:')assert.match(result.headers()['strict-transport-security']??'',/max-age=[1-9]\d*/);
  await expect(page.locator('main h1')).toBeVisible();
  if(route!=='/'){
   await expect(page.locator('article')).toBeVisible();
   const article=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).find(article=>route===`/guide/${article.slug}`);
   assert.ok(article,`Unknown smoke route: ${route}`);await expect(page.locator('main h1')).toHaveText(article.title);
  }
  if(route.includes('lumen'))await expect(page.locator('.architecture-plate').first()).toBeVisible();
 }
 await page.evaluate(()=>document.fonts.ready);
 assert.ok(await page.evaluate(()=>document.fonts.check('500 16px "DM Sans"')),'Local DM Sans did not load');
 const assets=['/assets/favicon-moon.svg','/assets/fonts/dm-sans-variable.ttf','/assets/fonts/libre-caslon-display.ttf'];
 for(const asset of assets){
  const result=await page.request.get(new URL(asset,base).href);assert.equal(result.status(),200,asset);
  assert.deepEqual(Buffer.from(await result.body()),fs.readFileSync(`dist${asset}`),`${asset}: differs from verified build`);
 }
 assert.deepEqual(external,[],'Unexpected third-party browser requests');assert.deepEqual(errors,[],'Browser errors');
 console.log(`Smoke checks passed: ${revision}, 3 rendered routes, configured headers, local fonts and favicon, no third-party requests.`);
}finally{await browser.close();}
