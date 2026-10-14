// scripts/write-release.mjs — Bind the published build to its exact Git revision.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
fs.writeFileSync('dist/release.json',JSON.stringify({revision,builtAt:new Date().toISOString()},null,2)+'\n');
console.log(`Release revision: ${revision}`);
