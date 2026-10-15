// Verify topic discovery, shared filters, focused reading order and mobile access.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const articles=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8'));
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');await expect(page.getByRole('region',{name:'Find your way'})).toBeVisible();
 await expect(page.locator('.guide-card')).toHaveCount(8);
 await page.getByRole('region',{name:'Find your way'}).getByRole('link',{name:/Find a guide or command/}).click();
 await expect(page.locator('main h1')).toHaveText('All guides');await expect(page.locator('.directory-list a')).toHaveCount(articles.length);
 const hrefs=await page.locator('.directory-list a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));assert.equal(new Set(hrefs).size,articles.length);
 await page.getByRole('combobox',{name:'Topic',exact:true}).selectOption('server');
 await expect(page.locator('.directory-topic h2')).toHaveText('Backend');
 await page.getByRole('searchbox',{name:'Find a guide or command'}).fill('middleware');
 await expect(page.locator('.directory-list a[href="/guide/django-middleware"]')).toBeVisible();
 await page.reload();await expect(page.getByRole('combobox',{name:'Topic',exact:true})).toHaveValue('server');await expect(page.getByRole('searchbox',{name:'Find a guide or command'})).toHaveValue('middleware');
 await page.getByRole('button',{name:'Clear filters'}).click();await expect(page.locator('.directory-list a')).toHaveCount(articles.length);
 await page.getByRole('searchbox',{name:'Find a guide or command'}).fill('no-such-topic-84721');await expect(page.locator('.directory-list a')).toHaveCount(0);await expect(page.getByText('No guides match. Try fewer words or clear the topic filter.')).toBeVisible();
 await page.goto(base+'/guide/git-basics');await expect(page.locator('nav[aria-label="Article sequence"] a')).toHaveCount(1);await expect(page.locator('nav[aria-label="Article sequence"] a')).toHaveAttribute('href','/guide/git-command-reference');
 await page.goto(base+'/guide/foundry-first-task');await expect(page.locator('.curriculum-group[open] summary')).toHaveText('Setup tutorial');await expect(page.getByRole('navigation',{name:'Article sequence'}).getByRole('link',{name:/Next in this topic/})).toHaveAttribute('href','/guide/foundry-review-release');
 await page.goto(base+'/guide/reports-release');await expect(page.getByRole('navigation',{name:'Article sequence'}).getByRole('link')).toHaveCount(1);
 await page.goto(base+'/guide/build-recipes?category=Server');await expect(page.locator('.recipe-card')).toHaveCount(2);await expect(page.getByRole('group',{name:'Recipe categories'}).getByRole('button',{name:'Backend',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/','/guides','/guides?topic=operations&q=heroku']){
  await page.goto(base+route);await expect(page.locator('main h1')).toBeVisible();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow');
 }
 await page.screenshot({path:'/private/tmp/handbook-guide-directory-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Organization passed: all guides reachable once, topic/query filters and reload, empty/reset states, focused reading sequences, legacy filters and mobile containment.');
}finally{await browser.close();}
