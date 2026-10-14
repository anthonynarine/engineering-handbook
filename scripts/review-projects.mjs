// scripts/review-projects.mjs — Compare recorded source-review revisions with local checkouts without updating review claims.
import fs from 'node:fs';
import path from 'node:path';
import { fingerprint } from './project-fingerprint.mjs';
import { execFileSync } from 'node:child_process';
const reviews=JSON.parse(fs.readFileSync(new URL('../src/features/projects/sourceReviews.json',import.meta.url),'utf8'));
const projectRoot=process.env.HANDBOOK_PROJECTS_ROOT??path.resolve('..');
const comparisons={};
for(const [id,review] of Object.entries(reviews)){
 try{
  const checkout=path.join(projectRoot,review.repository);
  const current=execFileSync('git',['-C',checkout,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const dirty=execFileSync('git',['-C',checkout,'status','--porcelain','--untracked-files=no'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().length>0;
  const scoped=Array.isArray(review.files)&&review.files.length>0&&!!review.fingerprint;
  const filesMatch=scoped?fingerprint(checkout,review.files)===review.fingerprint:null;
  const status=!review.revision?'BASELINE NOT RECORDED':!current.startsWith(review.revision)?'REVISION CHANGED':scoped?(filesMatch?'INSPECTED FILES MATCH':'INSPECTED FILES CHANGED'):dirty?'TRACKED CHANGES PRESENT':'RECORDED REVISION MATCHES';
  comparisons[id]={status,revision:current.slice(0,7),trackedEdits:dirty,filesMatch,scopeCount:scoped?review.files.length:0};
  console.log(`${review.repository}: ${status} | recorded ${review.revision??'none'} | current ${current.slice(0,7)} | inspected ${review.reviewed}${dirty?' | tracked edits present':''}`);
 }catch{
  comparisons[id]={status:'CHECKOUT UNAVAILABLE',revision:null,trackedEdits:false,filesMatch:null,scopeCount:0};
  console.log(`${review.repository}: CHECKOUT UNAVAILABLE | inspected ${review.reviewed}`);
 }
}
console.log('Source revision and explicit-file comparison only. Matching files do not verify runtime behavior. Review source changes before updating dates or revisions. Untracked files are outside this comparison.');

fs.writeFileSync(new URL('../src/features/projects/sourceComparison.json',import.meta.url),JSON.stringify(comparisons,null,2)+'\n');
