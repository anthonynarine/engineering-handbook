import {browserOptions} from './browser-options.mjs';
// tests/build-tools.mjs — Verify separate saved checklists, truthful exports, storage failure and recipe discovery.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const browser=await chromium.launch(browserOptions());
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');await page.getByRole('link',{name:'Open the starter checklist',exact:true}).click();
 const checklist=page.getByRole('region',{name:'Project starter checklist'});
 await checklist.getByRole('checkbox').first().waitFor();assert.equal(await checklist.getByRole('checkbox').count(),7);
 await checklist.getByRole('checkbox').first().check();await page.reload();
 assert.equal(await checklist.getByRole('checkbox').first().isChecked(),true);
 await checklist.getByRole('radio',{name:'Full-stack Django API and React'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.build-step input[type=checkbox]').length===12);
 assert.equal(await checklist.getByRole('checkbox').first().isChecked(),false);
 await checklist.getByRole('checkbox').first().check();await page.reload();
 assert.equal(await checklist.getByRole('radio',{name:'Full-stack Django API and React'}).isChecked(),true);
 await checklist.getByRole('radio',{name:'Frontend only React and static hosting'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.build-step input[type=checkbox]').length===7);
 assert.equal(await checklist.getByRole('checkbox').first().isChecked(),true);
 for(const checkbox of await checklist.getByRole('checkbox').all())await checkbox.check();
 await checklist.locator('.build-completion').waitFor();
 const downloadPromise=page.waitForEvent('download');await checklist.getByRole('button',{name:'Export checklist'}).click();const download=await downloadPromise;
 const text=fs.readFileSync(await download.path(),'utf8');assert.ok(text.includes('Self-reported progress only'));assert.ok(text.includes('No commands, tests or deployment checks were executed'));assert.equal((text.match(/- \[x\]/g)??[]).length,7);
 await checklist.getByRole('button',{name:'Reset frontend progress'}).click();assert.equal(await checklist.getByRole('checkbox').first().isChecked(),false);
 await checklist.getByRole('radio',{name:'Full-stack Django API and React'}).click();await page.waitForFunction(()=>document.querySelectorAll('.build-step input[type=checkbox]').length===12);assert.equal(await checklist.getByRole('checkbox').first().isChecked(),true);
 await page.goto(base+'/guide/build-recipes');
 const recipes=page.getByRole('region',{name:'Build recipe directory'});await recipes.locator('.recipe-card').first().waitFor();assert.equal(await recipes.locator('.recipe-card').count(),6);
 await recipes.getByRole('button',{name:'Backend',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.recipe-card').length===2);
 await recipes.getByRole('searchbox',{name:'Find a task'}).fill('websocket');await recipes.getByRole('button',{name:'Clear recipe filters'}).waitFor();
 await recipes.getByRole('button',{name:'Clear recipe filters'}).click();await page.waitForFunction(()=>document.querySelectorAll('.recipe-card').length===6);
 await recipes.getByRole('searchbox',{name:'Find a task'}).fill('websocket');await page.waitForFunction(()=>document.querySelectorAll('.recipe-card').length===1);await page.reload();assert.equal(await recipes.locator('.recipe-card').count(),1);
 await recipes.getByRole('link',{name:/Connect a live event stream/}).click();await page.locator('article h1').filter({hasText:'Recipe: connect a live event stream'}).waitFor();
 await page.locator('article .codeblock').first().getByRole('button',{name:'Copy',exact:true}).click();
 assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('observeTaskChanges'));
 await page.setViewportSize({width:390,height:844});
 for(const slug of ['project-starter-checklist?stack=fullstack','build-recipes','recipe-live-events','recipe-private-document']){
  await page.goto(base+'/guide/'+slug);await page.locator('article h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' overflow');
 }
 await page.screenshot({path:'/private/tmp/handbook-recipe-mobile.png',fullPage:true});
 await page.goto(base+'/guide/project-starter-checklist');await page.screenshot({path:'/private/tmp/handbook-checklist-mobile.png',fullPage:true});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};});const blockedPage=await blocked.newPage();
 await blockedPage.goto(base+'/guide/project-starter-checklist');await blockedPage.getByRole('checkbox').first().check();await blockedPage.getByText('Browser storage is unavailable; progress lasts only while this page stays open.',{exact:true}).waitFor();await blocked.close();
 assert.deepEqual(errors,[]);console.log('Build helpers passed: saved independent checklists, reload, reset, honest export, blocked storage, recipe filters/URLs, copy and mobile layout');
} finally {await browser.close();}
