// tests/security.mjs — Check renderer boundaries, CSP delivery and hostile local-storage inputs.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import assert from 'node:assert/strict';
import {findings} from '../scripts/lib/public-scan.mjs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
assert.ok(findings('AK'+'IA'+'A'.repeat(16)).includes('aws-access-key'));
assert.ok(findings('-'.repeat(5)+'BEGIN PRIVATE KEY'+'-'.repeat(5)).includes('private-key'));
assert.deepEqual(findings('A safe architecture example.'),[]);
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(base+'/guide/build-manual');const headers=response.headers();
 assert.equal(headers['x-content-type-options'],'nosniff');assert.equal(headers['x-frame-options'],'DENY');assert.ok(headers['content-security-policy'].includes("script-src 'self'"));assert.ok(headers['content-security-policy'].includes("script-src-attr 'none'"));assert.ok(headers['content-security-policy'].includes("frame-ancestors 'none'"));
 await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.__inlineRan=true';document.body.append(script);});assert.equal(await page.evaluate(()=>window.__inlineRan),undefined);
 if(!process.env.HANDBOOK_TEST_URL){
  await page.goto(base+'/__security/tests/fixtures/security.html');await page.getByRole('heading',{name:'Renderer security fixture'}).waitFor();
  await page.getByRole('alert').getByText('Diagram could not render. Its source is available below.',{exact:true}).waitFor();await page.locator('.mermaid-output svg').first().waitFor();
  assert.equal(await page.locator('a[href^="javascript:"],a[href^="data:"],a[href^="//"],img,iframe,[onerror],[onclick]').count(),0);assert.equal(await page.evaluate(()=>window.__securityFailure),undefined);
  assert.equal(await page.getByRole('link',{name:'safe',exact:true}).getAttribute('href'),'/guide/build-manual');
 }
 await page.goto(base+'/guide/learning-roadmap');await page.evaluate(()=>localStorage.setItem('handbook-learning-roadmap-v1','x'.repeat(300000)));await page.reload();await page.getByText('Saved data could not be read. Showing suggestions; nothing is overwritten until you make a change.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('handbook-learning-roadmap-v1').length),300000);
 await page.evaluate(()=>localStorage.setItem('handbook-learning-roadmap-v1',JSON.stringify({topics:[{id:'hostile-test',title:'<img src=x onerror=alert(1)>',reason:'<script>alert(1)</script>',exercise:'Synthetic exercise',criteria:'Synthetic criteria',guide:'javascript:alert(1)',status:'Next',suggested:false}]})));await page.reload();
 await page.getByRole('heading',{name:'<img src=x onerror=alert(1)>',exact:true}).waitFor();assert.equal(await page.locator('.learning-roadmap img,.learning-roadmap script,.learning-roadmap a[href^="javascript:"]').count(),0);
 assert.deepEqual(errors,[]);console.log('Security checks passed: configured headers, inline-script blocking, hostile Markdown/diagram fixture, escaped local notes and oversized storage.');
}finally{await browser.close();}
