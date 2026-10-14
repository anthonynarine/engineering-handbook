import {browserOptions} from './browser-options.mjs';
// tests/lumen.mjs — Verify flagship discovery, explicit planned status, diagrams and mobile access.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const slugs=new Set(JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).map(article=>article.slug));
const browser=await chromium.launch(browserOptions());
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/projects');await page.locator('.project-card').first().waitFor();
 assert.equal(await page.locator('.project-card').count(),7);
 const flagship=page.locator('.project-card').first();assert.ok((await flagship.innerText()).includes('FLAGSHIP / PLANNED AWS'));
 await flagship.getByRole('link',{name:'Lumen',exact:true}).click();await page.locator('.project-plate').first().waitFor();
 await page.locator('.article-meta').getByText('proposed design',{exact:true}).waitFor();
 assert.equal(await page.getByRole('navigation',{name:'Lumen design chapters'}).getByRole('link').count(),5);
 await page.getByRole('navigation',{name:'Lumen design chapters'}).getByRole('link',{name:'AWS topology',exact:true}).click();
 const map=page.locator('.diagram > .diagram-canvas .lumen-aws-plate');await map.waitFor();
 for(const href of await map.getByRole('link').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href'))))assert.ok(slugs.has(href.replace('/guide/','')),href);
 assert.ok((await map.textContent()).includes('All AWS resources and controls shown are planned'));
 await page.locator('.diagram').first().screenshot({path:'/private/tmp/handbook-lumen-aws-dark.png',style:'.topbar{visibility:hidden}'});
 await page.getByRole('button',{name:'Use light theme'}).click();await page.locator('.diagram').first().screenshot({path:'/private/tmp/handbook-lumen-aws-light.png',style:'.topbar{visibility:hidden}'});
 await page.getByRole('button',{name:'Expand diagram'}).click();await page.locator('.diagram-dialog[open] .lumen-aws-plate').waitFor();await page.keyboard.press('Escape');
 await page.goto(base+'/guide/lumen-aws-security');await page.locator('article h1').waitFor();assert.ok((await page.locator('article').innerText()).includes('Session Manager'));assert.ok((await page.locator('article').innerText()).includes('No clinical payload goes to a future external AI provider by default'));
 await page.setViewportSize({width:390,height:844});
 for(const slug of ['lumen-platform-design','lumen-aws-architecture','lumen-aws-security','lumen-aws-release']){
  await page.goto(base+'/guide/'+slug);await page.locator('article h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' mobile overflow');
 }
 await page.goto(base+'/guide/lumen-aws-architecture');await map.waitFor();await page.locator('.diagram').first().screenshot({path:'/private/tmp/handbook-lumen-aws-mobile.png',style:'.topbar{visibility:hidden}'});
 assert.deepEqual(errors,[]);console.log('Lumen passed: flagship placement, 4 proposed-design chapters, linked AWS diagram, themes, expansion and mobile access');
} finally {await browser.close();}
