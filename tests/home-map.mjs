import {browserOptions} from './browser-options.mjs';
// tests/home-map.mjs — Verify the homepage architecture map's links, controls and responsive containment.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const slugs=new Set(JSON.parse(fs.readFileSync('src/generated/articles.json','utf8')).map(a=>a.slug));
const browser=await chromium.launch(browserOptions());
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');
 const map=page.locator('.diagram > .diagram-canvas .build-system-plate');await map.waitFor();
 assert.equal(await map.getByRole('link').count(),12);
 const hrefs=await map.getByRole('link').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
 for(const href of hrefs)assert.ok(slugs.has(href.replace('/guide/','')),href);
 await page.locator('.diagram').first().screenshot({style:'.topbar{visibility:hidden}',path:'/private/tmp/handbook-home-map-dark.png'});
 await map.getByRole('link',{name:'Backend',exact:true}).focus();await page.keyboard.press('Enter');
 await page.waitForURL('**/guide/django-toolkit');
 await page.locator('.sidebar button[aria-label="Backend"][aria-expanded="true"]').waitFor();
 await page.goto(base+'/');
 await page.getByRole('button',{name:'Use light theme'}).click();
 await page.locator('.diagram').first().screenshot({style:'.topbar{visibility:hidden}',path:'/private/tmp/handbook-home-map-light.png'});
 await page.getByRole('button',{name:'Zoom in diagram'}).click();
 assert.equal(await page.locator('.diagram-tools>span').first().innerText(),'125%');
 await page.getByRole('button',{name:'Expand diagram'}).click();
 await page.locator('.diagram-dialog[open] .build-system-plate').waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Reset diagram zoom'}).click();
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const canvas=page.locator('.diagram > .diagram-canvas');
 assert.ok(await canvas.evaluate(node=>node.scrollWidth>node.clientWidth));
 await canvas.evaluate(node=>{node.scrollLeft=node.scrollWidth;});
 await page.locator('.diagram').first().screenshot({style:'.topbar{visibility:hidden}',path:'/private/tmp/handbook-home-map-mobile.png'});
 await map.getByRole('link',{name:'AI integration',exact:true}).click();await page.waitForURL('**/guide/deterministic-ai');
 assert.deepEqual(errors,[]);
 console.log('Homepage map passed: 12 valid links, keyboard navigation, both themes, zoom, expansion and mobile scrolling');
} finally {await browser.close();}
