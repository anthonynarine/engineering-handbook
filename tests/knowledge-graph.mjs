import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import assert from 'node:assert/strict';
const articleCount=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).length;
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage({viewport:{width:1500,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173');
 const graph=page.getByRole('group',{name:'Interactive guide graph',exact:true});await expect(graph.locator('.graph-note')).toHaveCount(articleCount);await expect(graph.locator('.graph-hub')).toHaveCount(0);
 await expect(graph.locator('.graph-node-icon')).toHaveCount(articleCount);await expect(graph.locator('[data-core]')).toHaveCount(9);const securityIcons=await graph.locator('[data-section=security] .graph-node-icon').evaluateAll(icons=>icons.map(icon=>icon.innerHTML));assert.ok(securityIcons.length>1&&securityIcons.every(icon=>icon===securityIcons[0]),'security branches repeat the core shield');await expect(graph.locator('[data-core] .graph-core-label')).toHaveCount(9);
 await expect(page.locator('.knowledge-header')).toHaveCount(0);await expect(page.getByRole('region',{name:'Connected handbook'})).toHaveCSS('border-top-width','1px');
 await expect(page.getByRole('searchbox',{name:'Search graph'})).toBeHidden();
 await page.waitForTimeout(2000);const cloud=await graph.locator('.graph-note').evaluateAll(nodes=>nodes.map(node=>{const matrix=node.transform.baseVal.consolidate().matrix;return {x:matrix.e,y:matrix.f};}));const width=Math.max(...cloud.map(p=>p.x))-Math.min(...cloud.map(p=>p.x));const height=Math.max(...cloud.map(p=>p.y))-Math.min(...cloud.map(p=>p.y));assert.ok(width/height>.8&&width/height<1.2,'cloud should be round');assert.ok(cloud.every(p=>Math.hypot(p.x-500,p.y-370)<350),'nodes settle within a radial envelope');
 const node=graph.locator('.graph-note[data-guide="git-basics"]');await node.focus();const before=await node.getAttribute('transform');await page.waitForTimeout(250);assert.equal(await node.getAttribute('transform'),before);
 const box=await node.locator('.graph-dot').boundingBox();assert.ok(box);const x=box.x+box.width/2,y=box.y+box.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+65,y-35,{steps:12});await page.mouse.up();assert.equal(new URL(page.url()).pathname,'/');assert.notEqual(await node.getAttribute('transform'),before);
 await node.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/guide\/git-basics$/);
 await page.goBack();await graph.locator('.graph-note[data-guide="git-basics"]').focus();await page.keyboard.press('Space');const dot=graph.locator('.graph-note[data-guide="git-basics"] .graph-dot');await dot.click({force:true});await expect(page).toHaveURL(/\/guide\/git-basics$/);
 await page.goBack();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const stable=await graph.locator('.graph-note').first().getAttribute('transform');await page.waitForTimeout(250);assert.equal(await graph.locator('.graph-note').first().getAttribute('transform'),stable);
 assert.deepEqual(errors,[]);console.log('Knowledge graph passed: plain guide cloud, tucked controls, stable focus, drag without navigation, click/Enter opens guide, reduced motion.');
}finally{await browser.close();}
