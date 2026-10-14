// scripts/run-browser-checks.mjs — Run the complete browser gate against a private local release server.
import {spawn,spawnSync} from 'node:child_process';
const {HANDBOOK_TEST_URL:ignoredRemote,...testEnv}=process.env;
const server=spawn(process.execPath,['scripts/serve-checks.mjs'],{stdio:['ignore','pipe','inherit']});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Check server did not start')),10000);server.once('exit',code=>{clearTimeout(timer);reject(Error(`Check server exited ${code}`));});server.stdout.on('data',()=>{clearTimeout(timer);resolve();});});
 for(const test of ['security','browser','curriculum','home-map','build-tools','reading-library','learning-roadmap','troubleshooting','lumen']){
  const result=spawnSync(process.execPath,[`tests/${test}.mjs`],{stdio:'inherit',env:testEnv});if(result.status!==0)throw Error(`${test} failed`);
 }
}finally{server.kill('SIGTERM');}
