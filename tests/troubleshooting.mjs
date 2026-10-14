import {browserOptions} from './browser-options.mjs';
// tests/troubleshooting.mjs — Verify symptom discovery, linkable selection and truthful diagnostic notes.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const slugs=new Set(JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).map(article=>article.slug));
const browser=await chromium.launch(browserOptions());
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');await page.getByRole('link',{name:'Something broken? Troubleshoot',exact:false}).click();
 const desk=page.getByRole('region',{name:'Troubleshooting desk'});await desk.locator('.diagnostic-card').first().waitFor();assert.equal(await desk.locator('.diagnostic-card').count(),6);
 await desk.getByRole('searchbox',{name:'What is going wrong?'}).fill('502');await page.waitForFunction(()=>document.querySelectorAll('.diagnostic-card').length===1);
 await desk.getByRole('button',{name:/ALB error or unhealthy target/}).click();const path=desk.getByRole('region',{name:'Selected diagnostic path'});await path.getByRole('heading',{name:'ALB error or unhealthy target'}).waitFor();assert.ok(page.url().includes('issue=alb'));
 await page.reload();await path.getByRole('heading',{name:'ALB error or unhealthy target'}).waitFor();
 await path.getByRole('button',{name:'Copy investigation notes',exact:true}).click();await path.getByRole('status').getByText('Investigation notes copied',{exact:true}).waitFor();
 const notes=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(notes.includes('Unexecuted diagnostic plan'));assert.ok(notes.includes('No application, infrastructure or security checks were executed'));assert.ok(notes.includes('/guide/troubleshoot-alb'));
 await path.getByRole('link',{name:'Open the full troubleshooting guide'}).click();await page.waitForURL('**/guide/troubleshoot-alb');await page.locator('article h1').waitFor();await expect(page.locator('article')).toContainText('planned Lumen AWS architecture');
 await page.goto(base+'/guide/troubleshooting-desk');
 await desk.getByRole('button',{name:'Security',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.diagnostic-card').length===2);
 await desk.getByRole('searchbox',{name:'What is going wrong?'}).fill('no-such-issue');await desk.getByRole('button',{name:'Clear troubleshooting filters'}).click();await page.waitForFunction(()=>document.querySelectorAll('.diagnostic-card').length===6);
 const symptoms=['Browser request blocked or rejected','Gait login, token or permission denial','ALB error or unhealthy target','React data stays stale after a write','Background job missing, late or duplicated','Migration or release schema check fails'];
 for(const symptom of symptoms){await desk.getByRole('button',{name:new RegExp(symptom.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();await path.getByRole('heading',{name:symptom,exact:true}).waitFor();const href=await path.getByRole('link').getAttribute('href');assert.ok(slugs.has(href.replace('/guide/','')));}
 await page.screenshot({path:'/private/tmp/handbook-troubleshooting-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Use light theme'}).click();await page.setViewportSize({width:390,height:844});
 for(const slug of ['troubleshooting-desk?issue=alb','troubleshoot-browser-api','troubleshoot-authentication','troubleshoot-alb','troubleshoot-query-cache','troubleshoot-background-jobs','troubleshoot-migrations']){
  await page.goto(base+'/guide/'+slug);await page.locator('article h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' mobile overflow');
 }
 await page.goto(base+'/guide/troubleshooting-desk?issue=identity');await path.getByRole('heading',{name:'Gait login, token or permission denial'}).waitFor();await page.screenshot({path:'/private/tmp/handbook-troubleshooting-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Troubleshooting passed: 6 symptoms, search/categories/reset, URL selection/reload, honest copied notes, linked guides, themes and mobile access');
} finally {await browser.close();}
