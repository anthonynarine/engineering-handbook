// scripts/deploy-release.mjs — Refuse stale verification before invoking the authorized Netlify deployment.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {artifactDigest} from './lib/artifact-digest.mjs';
const proof=JSON.parse(fs.readFileSync('.release/verified.json','utf8'));const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()||proof.revision!==revision||proof.artifact!==artifactDigest())throw Error('Uncommitted source or changed candidate/artifact: repeat release:prepare.');
execFileSync('netlify',['deploy','--site','4328cb47-ee6a-4f9d-88b1-b0871acb77d5','--dir','dist','--no-build','--prod','--message',`Verified handbook ${revision}`,'--json'],{stdio:'inherit'});
