// scripts/prepare-release.mjs — Produce local evidence only for a clean, tested candidate and matching artifact.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {artifactDigest} from './lib/artifact-digest.mjs';
function git(...args){return execFileSync('git',args,{encoding:'utf8'}).trim();}
if(git('status','--porcelain'))throw Error('Commit the reviewed source before preparing a release.');
const revision=git('rev-parse','HEAD');
for(const command of ['build:release','test:release'])execFileSync('npm',['run',command],{stdio:'inherit'});
if(git('status','--porcelain')||git('rev-parse','HEAD')!==revision)throw Error('Source changed during verification; commit and repeat.');
fs.mkdirSync('.release',{recursive:true});fs.writeFileSync('.release/verified.json',JSON.stringify({revision,artifact:artifactDigest(),verifiedAt:new Date().toISOString()},null,2)+'\n');console.log('Candidate and artifact verified; npm run release:deploy can publish this exact build.');
