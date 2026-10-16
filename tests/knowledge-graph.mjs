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
 await expect(graph.locator('.graph-note')).toHaveCount(articles.length);await expect(graph.locator('.graph-hub')).toHaveCount(8);await expect(graph.locator('.graph-hub .graph-section-icon')).toHaveCount(8);await expect(page.locator('main > :first-child')).toHaveClass('knowledge-map');await expect(map.locator('h1')).toHaveText('Your engineering handbook.Connected.');
 for(const icon of ['layers','workflow','server','monitor','shield-check','sparkles','cloud','folder-kanban'])await expect(graph.locator('.graph-hub svg.lucide-'+icon)).toHaveCount(1);
 const before=await graph.locator('.graph-note').first().getAttribute('transform');await expect.poll(()=>graph.locator('.graph-note').first().getAttribute('transform')).not.toBe(before);

 const neuron=graph.locator('.graph-note').first();await neuron.focus();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const resting=await graph.locator('.graph-note').evaluateAll(nodes=>nodes.map(node=>{const matrix=node.transform.baseVal.consolidate().matrix;return [matrix.e,matrix.f];}));
 const held=await neuron.getAttribute('transform');await neuron.locator('.graph-hit').hover();
 await expect.poll(async()=>graph.locator('.graph-note').evaluateAll((nodes,resting)=>Math.max(...nodes.map((node,index)=>{const matrix=node.transform.baseVal.consolidate().matrix;return Math.hypot(matrix.e-resting[index][0],matrix.f-resting[index][1]);})),resting)).toBeGreaterThan(10);
 await expect(neuron).toHaveAttribute('transform',held);await expect(graph.locator('.graph-note.is-near')).not.toHaveCount(0);
 await neuron.locator('.graph-hit').click();await expect(inspector.getByRole('heading',{level:3})).toHaveText(articles[0].title);
 await page.mouse.move(0,0);

 const outer=graph.locator('[data-guide="ai-evaluation-and-fallbacks"]');await outer.focus();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const dot=await outer.locator('.graph-hit').boundingBox();const lockedPosition=await outer.getAttribute('transform');
 await page.mouse.move(dot.x+dot.width/2-90,dot.y+dot.height/2);await page.waitForTimeout(180);await expect(outer).toHaveAttribute('transform',lockedPosition);
 await page.mouse.move(dot.x+dot.width/2-36,dot.y+dot.height/2);
 const preview=map.locator('.graph-preview');await expect(preview.locator('strong')).toHaveText(articles.find(article=>article.slug==='ai-evaluation-and-fallbacks').title);
 await page.mouse.move(dot.x+dot.width/2-60,dot.y+dot.height/2);await page.waitForTimeout(180);await expect(outer).toHaveAttribute('transform',lockedPosition);await expect(preview).toBeVisible();await map.screenshot({path:'/private/tmp/handbook-node-lock-preview.png'});
 await preview.getByRole('button',{name:'Select guide'}).click();await expect(inspector.getByRole('heading',{level:3})).toHaveText(articles.find(article=>article.slug==='ai-evaluation-and-fallbacks').title);
 await page.mouse.move(0,0);await page.waitForTimeout(180);await expect(outer).toHaveAttribute('transform',lockedPosition);
 await graph.getByRole('button',{name:'Explore section: Backend',exact:true}).focus();await page.keyboard.press('Enter');await expect(inspector.getByRole('heading',{level:3})).toHaveText('Backend');await expect(inspector.getByRole('link',{name:'Start here'})).toHaveAttribute('href','/guide/django-toolkit');
 await graph.getByRole('button',{name:'Explore guide: Git command reference',exact:true}).focus();await page.keyboard.press('Enter');await expect(inspector.getByRole('heading',{level:3})).toHaveText('Git command reference');await expect(graph.locator('.graph-edges .is-related')).not.toHaveCount(0);await expect(inspector.getByRole('link',{name:'Open this guide'})).toHaveAttribute('href','/guide/git-command-reference');
 await map.getByRole('button',{name:'Zoom in knowledge graph',exact:true}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('120%');
 await map.getByRole('button',{name:'Reset knowledge graph view'}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('100%');
 const bounds=await graph.boundingBox();await page.mouse.move(bounds.x+bounds.width*.95,bounds.y+bounds.height*.45);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.95-80,bounds.y+bounds.height*.45+40,{steps:5});await page.mouse.up();await expect(graph.locator(':scope > g')).not.toHaveAttribute('transform','translate(0 0) translate(500 370) scale(1) translate(-500 -370)');await map.getByRole('button',{name:'Reset knowledge graph view'}).click();
 await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-dark.png'});
 await page.getByRole('button',{name:'Use light theme'}).click();await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-light.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const still=await graph.locator('.graph-note').first().getAttribute('transform');await page.waitForTimeout(150);assert.equal(await graph.locator('.graph-note').first().getAttribute('transform'),still);
 await inspector.getByRole('link',{name:'Open this guide'}).click();await expect(page.locator('article h1')).toHaveText('Git command reference');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await expect(graph).toBeHidden();
 await map.getByRole('navigation',{name:'Knowledge graph sections'}).getByRole('button',{name:/Cloud & CI\/CD/}).click();await expect(inspector.getByRole('heading',{level:3})).toHaveText('Cloud & CI/CD');
 await expect(inspector.getByRole('link',{name:'CI/CD: checks, review, release',exact:true})).toBeVisible();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await map.screenshot({path:'/private/tmp/handbook-knowledge-graph-mobile.png'});await inspector.getByRole('link',{name:'Start here'}).click();await expect(page.locator('article h1')).toHaveText('CI/CD: checks, review, release');
 assert.deepEqual(errors,[]);console.log('Knowledge graph passed: every guide/section, animated layout, cursor repulsion, proximity lock, full titles, retention and pinned selection, keyboard selection, related links, zoom, drag/reset, themes, reduced motion and mobile list navigation.');
}finally{await browser.close();}
