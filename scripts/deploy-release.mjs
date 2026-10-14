// scripts/deploy-release.mjs — Refuse stale verification before invoking the authorized Netlify deployment.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {artifactDigest} from './lib/artifact-digest.mjs';
const proof=JSON.parse(fs.readFileSync('.release/verified.json','utf8'));const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()||proof.revision!==revision||proof.artifact!==artifactDigest())throw Error('Uncommitted source or changed candidate/artifact: repeat release:prepare.');
execFileSync('netlify',['deploy','--site','4328cb47-ee6a-4f9d-88b1-b0871acb77d5','--dir','dist','--no-build','--prod','--message',`Verified handbook ${revision}`,'--json'],{stdio:'inherit'});
try{
 execFileSync(process.execPath,['scripts/check-production.mjs','https://anthony-narine-engineering-handbook.netlify.app',revision],{stdio:'inherit'});
 fs.writeFileSync('.release/deployed.json',JSON.stringify({revision,artifact:proof.artifact,verifiedAt:new Date().toISOString()},null,2)+'\n');
}catch(error){
 console.error('Publication completed, but live verification failed. Inspect the live site and Netlify deploy history before declaring success; no automatic rollback was attempted.');
 throw error;
}
