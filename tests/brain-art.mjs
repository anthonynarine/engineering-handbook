import fs from 'node:fs';
// The artwork must open directly from disk and remain entirely offline.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
execFileSync(process.execPath,['scripts/build-brain-art.mjs'],{stdio:'inherit'});
const url=pathToFileURL(path.resolve('artifacts/the-brain.html')).href;
const articleCount=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).length;
const browser=await chromium.launch(browserOptions());
try{
 const context=await browser.newContext({viewport:{width:1600,height:1000},offline:true,reducedMotion:'reduce'});const page=await context.newPage();const errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});await page.goto(url);
 const graph=page.getByRole('group',{name:'Interactive guide graph',exact:true});await expect(page.getByRole('heading',{name:'The brain',exact:true})).toBeVisible();await expect(graph.locator('.graph-note')).toHaveCount(articleCount);await expect(graph).toHaveAttribute('data-space','3d');await expect(page.getByLabel('Knowledge graph zoom')).toHaveText('80%');await expect(page.getByRole('button',{name:'Expand knowledge graph'})).toBeHidden();await expect(page.locator('.graph-options')).toBeHidden();await expect(page.locator('.graph-inspector')).toBeHidden();
 const box=await graph.boundingBox();await page.mouse.move(box.x+15,box.y+160);await page.mouse.down();await page.mouse.move(box.x+95,box.y+200,{steps:12});await page.mouse.up();await expect(graph).not.toHaveAttribute('data-yaw','0');await page.getByRole('button',{name:'Reset knowledge graph view'}).click();await expect(graph).toHaveAttribute('data-yaw','0');
 const shield=graph.locator('.graph-note[data-guide="security-boundaries"]');await shield.focus();await page.keyboard.press('Enter');await expect(shield).toHaveAttribute('aria-pressed','true');await expect(page.locator('.graph-art-label strong')).toHaveText(/Security starts/);assert.equal(page.url(),url);await page.mouse.move(15,15);await page.screenshot({path:'/private/tmp/the-brain-artwork-desktop.png'});
 await page.getByRole('button',{name:'3D globe mode'}).click();await expect(graph).toHaveAttribute('data-space','2d');await page.getByRole('button',{name:'3D globe mode'}).click();await expect(graph).toHaveAttribute('data-space','3d');
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},offline:true,isMobile:true,hasTouch:true,reducedMotion:'reduce'});const phone=await mobileContext.newPage();await phone.goto(url);await expect(phone.getByRole('group',{name:'Interactive guide graph',exact:true})).toBeVisible();assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight));await phone.screenshot({path:'/private/tmp/the-brain-artwork-mobile.png'});await phone.close();assert.deepEqual(network,[]);assert.deepEqual(errors,[]);console.log('Brain artwork passed: file:// offline loading, embedded assets, globe rotation, reset, node exploration without navigation, 2D/3D modes, and full-screen mobile layout.');
}finally{await browser.close();}
