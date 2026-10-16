// Regression coverage for interaction, organization and visual contrast found during review.
import {chromium,expect} from '@playwright/test';
import {browserOptions} from './browser-options.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch(browserOptions());const base=process.env.HANDBOOK_TEST_URL??'http://127.0.0.1:4173';
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/');const graph=page.getByRole('group',{name:'Interactive guide graph',exact:true});
 // Browser zoom gestures must not be captured by the graph.
 assert.ok(await graph.evaluate(svg=>svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,ctrlKey:true,bubbles:true,cancelable:true}))));await expect(page.getByLabel('Knowledge graph zoom')).toHaveText('80%');
 // A background click must not follow a stale hover target.
 await graph.locator('.graph-note[data-guide="git-basics"]').focus();await page.keyboard.press('Space');await graph.click({position:{x:20,y:200}});await expect(page).toHaveURL(base+'/');
 // A canceled pointer gesture clears the transient highlighted title.
 await graph.dispatchEvent('pointercancel',{pointerId:1});await expect(graph.locator('.is-locked')).toHaveCount(0);
 await page.goto(base+'/');
 for(const theme of ['dark','light']){
  if(theme==='light')await page.getByRole('button',{name:'Use light theme'}).click();
  const ratios=await graph.locator('[data-core] .graph-node-icon').evaluateAll(icons=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');const lum=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const bg=lum(getComputedStyle(document.documentElement).getPropertyValue('--bg'));return icons.map(icon=>{const fg=lum(getComputedStyle(icon).color);return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);});});assert.ok(ratios.every(r=>r>=3),theme+' core icons need at least 3:1 contrast');
  await page.getByRole('region',{name:'Connected handbook'}).screenshot({path:`/private/tmp/handbook-audit-${theme}.png`});
 }
 await page.goto(base+'/guide/django-middleware#%E0%A4%A');await expect(page.locator('article h1')).toBeVisible();await page.getByRole('link',{name:'View connections'}).click();await expect(page).toHaveURL(/graph=local&focus=django-middleware/);await expect(graph.locator('.graph-note[data-guide="django-middleware"]')).toBeVisible();
 const neighbor=graph.locator('.graph-note:not([data-guide="django-middleware"])').first();const box=await neighbor.locator('.graph-dot').boundingBox();assert.ok(box);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+50,box.y+box.height/2+30,{steps:8});await page.mouse.up();assert.equal(new URL(page.url()).searchParams.get('focus'),'django-middleware','dragging a neighbor must not change local focus');
 await page.goto(base+'/');await page.setViewportSize({width:390,height:844});await page.getByRole('navigation',{name:'Knowledge graph sections'}).getByRole('button',{name:/Security/}).click();await expect(graph.locator('.graph-note:not([data-section="security"])')).toHaveCount(0);assert.ok(await graph.locator('.graph-note').count()>1);assert.equal(new URL(page.url()).searchParams.get('topic'),'security');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);console.log('Graph audit passed: browser zoom preserved, safe canvas/cancel, theme contrast, malformed hash, article connections, stable local dragging and mobile topic filtering.');
}finally{await browser.close();}
