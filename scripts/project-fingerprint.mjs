// scripts/project-fingerprint.mjs — Hash an explicit, inspected source-file scope without scanning a checkout.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export function fingerprint(checkout,files){
 const hash=createHash('sha256');
 for(const file of [...files].sort()){
  if(path.isAbsolute(file)||file.split('/').includes('..')||/(^|\/)(\.env(?:\.|$)|\.git|\.foundry|\.claude|\.codex|auth_venv|node_modules|db\.sqlite3)/.test(file))throw Error('Unsupported review scope');
  const root=fs.realpathSync(checkout);const target=fs.realpathSync(path.join(root,file));
  if(!target.startsWith(root+path.sep))throw Error('Review path escapes checkout');
  hash.update(file+'\0');hash.update(fs.readFileSync(target));hash.update('\0');
 }
 return hash.digest('hex');
}
