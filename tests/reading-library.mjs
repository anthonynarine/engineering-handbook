import {browserOptions} from './browser-options.mjs';
// tests/reading-library.mjs — Verify local bookmarks/history, reset isolation and storage fallback.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const browser=await chromium.launch(browserOptions());
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/guide/api-contracts');
 assert.equal(await page.locator('.sidebar button[aria-label="Server"] svg.lucide-server').count(),1);
 assert.equal(await page.locator('.sidebar button[aria-label="Client"] svg.lucide-monitor').count(),1);
 await page.getByRole('button',{name:'Save guide',exact:true}).click();await page.getByRole('button',{name:'Remove bookmark',exact:true}).waitFor();await page.reload();await page.getByRole('button',{name:'Remove bookmark',exact:true}).waitFor();
 await page.goto(base+'/guide/testing-strategy');await page.locator('article h1').waitFor();await page.locator('.article-bookmark').getByRole('link').click();await page.waitForURL('**/guide/my-library');
 const saved=page.getByRole('region',{name:'Saved guides',exact:true});const recent=page.getByRole('region',{name:'Recently viewed',exact:true});
 await expect(saved.getByRole('link')).toHaveCount(1);await expect(recent.getByRole('link')).toHaveCount(2);assert.ok((await recent.getByRole('link').first().innerText()).includes('Testing strategy'));
 await saved.getByRole('button',{name:/Remove bookmark: API contracts/}).click();await expect(saved.getByRole('link')).toHaveCount(0);await expect(recent.getByRole('link')).toHaveCount(2);
 await recent.getByRole('link').first().click();await page.getByRole('button',{name:'Save guide',exact:true}).click();await page.locator('.article-bookmark').getByRole('link').click();
 await recent.getByRole('button',{name:'Clear reading history',exact:true}).click();await expect(recent.getByRole('link')).toHaveCount(0);await expect(saved.getByRole('link')).toHaveCount(1);await page.reload();await expect(recent.getByRole('link')).toHaveCount(0);await expect(saved.getByRole('link')).toHaveCount(1);
 await saved.getByRole('button',{name:'Clear bookmarks',exact:true}).click();await expect(saved.getByRole('link')).toHaveCount(0);
 await page.evaluate(()=>localStorage.setItem('handbook-reading-library-v1',JSON.stringify({saved:['api-contracts','api-contracts','missing-guide'],recent:['testing-strategy','testing-strategy','missing-guide']})));await page.reload();await expect(saved.getByRole('link')).toHaveCount(1);await expect(recent.getByRole('link')).toHaveCount(1);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/private/tmp/handbook-library-mobile.png',fullPage:true});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};});const blockedPage=await blocked.newPage();await blockedPage.goto(base+'/guide/api-contracts');await blockedPage.getByRole('button',{name:'Save guide',exact:true}).click();await blockedPage.locator('.article-bookmark').getByRole('link').click();await blockedPage.getByText('Browser storage is unavailable. Lists last only for this open session.',{exact:true}).waitFor();assert.equal(await blockedPage.getByRole('region',{name:'Saved guides',exact:true}).getByRole('link').count(),1);await blocked.close();
 assert.deepEqual(errors,[]);console.log('Reading library passed: Server/Client icons, bookmark persistence/removal, recent ordering, isolated clears, invalid IDs, blocked storage and mobile layout');
} finally {await browser.close();}
