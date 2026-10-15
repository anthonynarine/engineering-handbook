// Verify graph discovery, interactions, motion preferences and the equivalent mobile list.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const articles=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8'));
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage({viewport:{width:1500,height:1050}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');const map=page.getByRole('region',{name:'Connected handbook'});const graph=map.getByRole('group',{name:'Interactive guide graph',exact:true});const inspector=map.getByRole('complementary',{name:'Selected knowledge'});
 await expect(graph.locator('.graph-note')).toHaveCount(articles.length);await expect(graph.locator('.graph-hub')).toHaveCount(8);
 const before=await graph.locator('.graph-note').first().getAttribute('transform');await expect.poll(()=>graph.locator('.graph-note').first().getAttribute('transform')).not.toBe(before);
 await graph.getByRole('button',{name:'Explore section: Backend',exact:true}).focus();await page.keyboard.press('Enter');await expect(inspector.getByRole('heading',{level:3})).toHaveText('Backend');await expect(inspector.getByRole('link',{name:'Start here'})).toHaveAttribute('href','/guide/django-toolkit');
 await graph.getByRole('button',{name:'Explore guide: Git command reference',exact:true}).focus();await page.keyboard.press('Enter');await expect(inspector.getByRole('heading',{level:3})).toHaveText('Git command reference');await expect(graph.locator('.graph-edges .is-related')).not.toHaveCount(0);await expect(inspector.getByRole('link',{name:'Open this guide'})).toHaveAttribute('href','/guide/git-command-reference');
 await map.getByRole('button',{name:'Zoom in knowledge graph',exact:true}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('120%');
 await map.getByRole('button',{name:'Reset knowledge graph view'}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('100%');
 const bounds=await graph.boundingBox();await page.mouse.move(bounds.x+20,bounds.y+120);await page.mouse.down();await page.mouse.move(bounds.x+100,bounds.y+170,{steps:5});await page.mouse.up();await expect(graph.locator(':scope > g')).not.toHaveAttribute('transform','translate(0 0) translate(500 370) scale(1) translate(-500 -370)');await map.getByRole('button',{name:'Reset knowledge graph view'}).click();
 await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-dark.png'});
 await page.getByRole('button',{name:'Use light theme'}).click();await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-light.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const still=await graph.locator('.graph-note').first().getAttribute('transform');await page.waitForTimeout(150);assert.equal(await graph.locator('.graph-note').first().getAttribute('transform'),still);
 await inspector.getByRole('link',{name:'Open this guide'}).click();await expect(page.locator('article h1')).toHaveText('Git command reference');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await expect(graph).toBeHidden();
 await map.getByRole('navigation',{name:'Knowledge graph sections'}).getByRole('button',{name:/Cloud & CI\/CD/}).click();await expect(inspector.getByRole('heading',{level:3})).toHaveText('Cloud & CI/CD');
 await expect(inspector.getByRole('link',{name:'CI/CD: checks, review, release',exact:true})).toBeVisible();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-mobile.png'});await inspector.getByRole('link',{name:'Start here'}).click();await expect(page.locator('article h1')).toHaveText('CI/CD: checks, review, release');
 assert.deepEqual(errors,[]);console.log('Knowledge graph passed: every guide/section, animated layout, keyboard selection, related links, zoom, drag/reset, themes, reduced motion and mobile list navigation.');
}finally{await browser.close();}
