import {browserOptions} from './browser-options.mjs';
// tests/curriculum.mjs — Verify curriculum navigation, code presentation and mobile access.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const browser=await chromium.launch(browserOptions());
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');
 await page.getByRole('link',{name:'Start the build workflow',exact:false}).click();
 await page.locator('article h1').filter({hasText:'My build workflow: from repo to release'}).waitFor();
 await page.goto(base+'/guide/django-middleware');
 const group=page.locator('.curriculum-group').filter({has:page.locator('summary', {hasText:'Core tools'})});
 await group.locator('a[aria-current="page"]').waitFor();
 assert.equal(await group.getAttribute('open'),'');
 assert.equal(await page.locator('.curriculum-group[open]').count(),1);
 await group.locator('summary').focus();await page.keyboard.press('Enter');
 assert.equal(await group.getAttribute('open'),null);
 await page.locator('.curriculum-group summary').filter({hasText:'Getting started'}).click();
 await page.locator('.curriculum-group').getByRole('link',{name:'Set up a Django workspace',exact:true}).click();
 await page.locator('article h1').filter({hasText:'Set up a Django workspace'}).waitFor();
 assert.ok((await page.locator('article').innerText()).includes('startapp tasks apps/tasks'));
 await page.goto(base+'/guide/full-stack-folder-structure');
 for(const filename of ['/.gitignore','/backend/.gitignore','/frontend/.gitignore'])assert.ok((await page.locator('article').innerText()).includes(filename));
 await page.goto(base+'/guide/frontend-folder-structure');
 await page.locator('article h1').waitFor();
 assert.ok((await page.locator('article').innerText()).includes('npm install axios @tanstack/react-query'));
 await page.goto(base+'/guide/django-toolkit');
 const links=await page.locator('article a[href^="/guide/"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
 for(const href of [...new Set(links)]){
  await page.goto(base+href);await page.locator('article h1').waitFor();
  assert.equal(await page.locator('main').getByText('Guide not found',{exact:true}).count(),0);
 }
 await page.goto(base+'/guide/websocket-design');
 await page.locator('.diagram-canvas svg').first().waitFor();
 assert.equal(await page.locator('.diagram [role="alert"]').count(),0);
 await page.setViewportSize({width:390,height:844});
 for(const slug of ['build-manual','django-toolkit','django-first-api','django-middleware','django-cors','websocket-design','django-channels','full-stack-folder-structure','frontend-folder-structure','react-api-connection','gait-auth-walkthrough','git-basics','git-command-reference','git-worktrees','heroku-django-deployment','heroku-operations']){
  await page.goto(base+'/guide/'+slug);await page.locator('article h1').waitFor();
  await page.waitForTimeout(100);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' mobile overflow');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const [slug,label] of [['git-basics','Git essentials'],['heroku-operations','Heroku field guide']]){
  await page.goto(base+'/guide/'+slug);await page.locator('article h1').waitFor();
  const group=page.locator('.curriculum-group').filter({has:page.locator('summary',{hasText:label})});
  await group.locator('a[aria-current="page"]').waitFor();assert.equal(await group.getAttribute('open'),'');
  await group.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await group.getAttribute('open'),null);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/guide/django-channels');
 await page.getByRole('button',{name:'Toggle navigation'}).click();
 await page.locator('.sidebar.open .curriculum-group a[aria-current="page"]').waitFor();
 await page.screenshot({path:'/private/tmp/handbook-django-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('Django curriculum: keyboard dropdowns, direct-link expansion, reading path, folder examples and mobile checks passed');
} finally {await browser.close();}
