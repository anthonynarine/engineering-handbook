// Verify global/local discovery against actual guide links, controls and mobile access.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
const articles=JSON.parse(fs.readFileSync('src/generated/articles.json','utf8'));
const known=new Set(articles.map(article=>article.slug));const adjacency=new Map(articles.map(article=>[article.slug,new Set()]));
for(const article of articles)for(const id of [...article.related,...[...article.body.matchAll(/\]\(\/guide\/([a-z0-9-]+)(?:#[^)]*)?\)/g)].map(match=>match[1])])if(known.has(id)&&id!==article.slug){adjacency.get(article.slug).add(id);adjacency.get(id).add(article.slug);}
const browser=await chromium.launch(browserOptions());
try{
 const page=await browser.newPage({viewport:{width:1500,height:1050}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/');const map=page.getByRole('region',{name:'Connected handbook'});const graph=map.getByRole('group',{name:'Interactive guide graph',exact:true});
 await expect(graph.locator('.graph-note')).toHaveCount(articles.length);await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('80%');
 async function setSlider(name,value){const slider=map.getByRole('slider',{name,exact:true});const min=Number(await slider.getAttribute('min'));const step=Number(await slider.getAttribute('step'));await slider.focus();await slider.press('Home');for(let index=0;index<Math.round((Number(value)-min)/step);index++)await slider.press('ArrowRight');}
 const degree=await graph.locator('.graph-note').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.guide,count:Number(node.dataset.connections),radius:Number(node.querySelector('.graph-dot').getAttribute('r'))})));
 for(const node of degree)assert.equal(node.count,adjacency.get(node.id).size,node.id);
 const largest=[...degree].sort((a,b)=>b.count-a.count)[0];const smallest=[...degree].sort((a,b)=>a.count-b.count)[0];assert.ok(largest.radius>smallest.radius);
 await map.locator('.graph-options > summary').click();await map.getByRole('searchbox',{name:'Search graph'}).fill('middleware');await expect(graph.locator('.graph-note[data-guide="django-middleware"]')).toHaveCount(1);await expect.poll(()=>graph.locator('.graph-note').count()).toBeLessThan(articles.length);
 await map.getByRole('combobox',{name:'Graph topic',exact:true}).selectOption('client');await map.getByRole('searchbox',{name:'Search graph'}).fill('no-such-graph-guide-8471');await expect(graph.locator('.graph-note')).toHaveCount(0);await expect(map.getByRole('heading',{name:'No guides match'})).toBeVisible();
 await map.getByRole('button',{name:'Show all guides'}).click();await expect(graph.locator('.graph-note')).toHaveCount(articles.length);
 await map.getByRole('combobox',{name:'Graph topic',exact:true}).selectOption('server');await map.getByRole('searchbox',{name:'Search graph'}).fill('middleware');await page.reload();await map.locator('.graph-options > summary').click();await expect(map.getByRole('combobox',{name:'Graph topic',exact:true})).toHaveValue('server');await expect(graph.locator('.graph-note[data-guide="django-middleware"]')).toBeVisible();
 await map.getByRole('button',{name:'Clear graph filters'}).click();await map.getByRole('button',{name:'Local graph',exact:true}).click();await map.getByRole('combobox',{name:'Focus guide',exact:true}).selectOption('git-basics');
 const local1=new Set(['git-basics',...adjacency.get('git-basics')]);await expect(graph.locator('.graph-note')).toHaveCount(local1.size);
 assert.deepEqual(new Set(await graph.locator('.graph-note').evaluateAll(nodes=>nodes.map(node=>node.dataset.guide))),local1);
 await expect(graph.locator('.graph-hub')).toHaveCount(0);
 await map.getByRole('combobox',{name:'Connection depth',exact:true}).selectOption('2');const local2=new Set(local1);for(const id of local1)for(const other of adjacency.get(id))local2.add(other);await expect(graph.locator('.graph-note')).toHaveCount(local2.size);assert.ok(local2.size>local1.size);
 await page.reload();await map.locator('.graph-options > summary').click();await expect(map.getByRole('combobox',{name:'Connection depth',exact:true})).toHaveValue('2');await expect(graph.locator('.graph-note')).toHaveCount(local2.size);
 await map.getByRole('button',{name:'Global graph',exact:true}).click();await expect(graph.locator('.graph-note')).toHaveCount(articles.length);
 assert.equal(new URL(page.url()).pathname,'/');await map.locator('.graph-options > summary').click();await graph.scrollIntoViewIfNeeded();await graph.hover({position:{x:20,y:200}});await page.mouse.wheel(0,-200);await expect.poll(()=>map.getByLabel('Knowledge graph zoom').textContent()).not.toBe('80%');await map.getByRole('button',{name:'Reset knowledge graph view'}).click();
 await graph.locator('.graph-note').first().focus();await page.keyboard.press('+');await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('100%');await map.getByRole('button',{name:'Reset knowledge graph view'}).click();
 await map.locator('.graph-options > summary').click();await map.locator('.graph-settings summary').click();const marker=graph.locator('.graph-note').first().locator('.graph-dot');const radius=Number(await marker.getAttribute('r'));
 await setSlider('Node size','1.5');await expect.poll(async()=>Number(await marker.getAttribute('r'))).toBeGreaterThan(radius);
 await setSlider('Link thickness','1.5');await expect(graph.locator('.graph-edges line').first()).toHaveCSS('stroke-width','1.5px');
 for(const [name,value] of [['Center force','0.02'],['Repel force','0.08'],['Link force','0.004'],['Link distance','220']]){await setSlider(name,value);await expect(map.getByRole('slider',{name,exact:true})).toHaveValue(value);}
 await map.getByRole('button',{name:'Restore graph defaults'}).click();await expect(map.getByRole('slider',{name:'Node size',exact:true})).toHaveValue('1');
 await map.locator('.graph-options > summary').click();await map.getByRole('button',{name:'Expand knowledge graph'}).click();const expanded=page.getByRole('dialog',{name:'Expanded knowledge graph'});await expect(expanded).toBeVisible();await expect(expanded.locator('.graph-note')).toHaveCount(articles.length);await page.keyboard.press('Escape');await expect(expanded).toHaveCount(0);await expect(map.getByRole('button',{name:'Expand knowledge graph'})).toBeFocused();
 await map.screenshot({path:'/private/tmp/handbook-graph-workspace-desktop.png',style:'.topbar{visibility:hidden}'});
 await page.setViewportSize({width:390,height:844});await expect(graph).toBeVisible();await expect(graph).toHaveAttribute('viewBox','200 0 600 740');await map.getByRole('button',{name:'Zoom in knowledge graph'}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('100%');await map.getByRole('button',{name:'Reset knowledge graph view'}).click();await expect(map.getByLabel('Knowledge graph zoom')).toHaveText('80%');await map.locator('.graph-options > summary').click();await map.getByRole('combobox',{name:'Graph topic',exact:true}).selectOption('operations');await expect(map.getByRole('combobox',{name:'Graph topic',exact:true})).toHaveValue('operations');await map.getByRole('searchbox',{name:'Search graph'}).fill('heroku');await expect(map.locator('.graph-inspector-links a[href="/guide/heroku-django-deployment"]')).toBeVisible();await expect(map.getByRole('complementary',{name:'Selected knowledge'}).getByRole('heading',{level:3})).toHaveText('Cloud & CI/CD');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await map.screenshot({path:'/private/tmp/handbook-graph-workspace-mobile.png',style:'.topbar{visibility:hidden}'});assert.deepEqual(errors,[]);
 console.log('Graph workspace passed: link-derived degrees/sizes, query/topic filters, empty/reset states, URL reload, local depth 1/2, wheel/keyboard zoom, settings/defaults, expanded focus and mobile results.');
}finally{await browser.close();}
