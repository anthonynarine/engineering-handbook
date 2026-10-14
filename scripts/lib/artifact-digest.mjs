// scripts/lib/artifact-digest.mjs — Bind evidence to every deployed path and byte.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
export function artifactDigest(root='dist'){
 const hash=createHash('sha256');function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Release symlinks are forbidden');if(entry.isDirectory())walk(file);else{hash.update(path.relative(root,file)+'\0');hash.update(fs.readFileSync(file));hash.update('\0');}}}walk(root);return hash.digest('hex');
}
