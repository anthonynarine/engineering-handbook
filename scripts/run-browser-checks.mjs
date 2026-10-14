// scripts/run-browser-checks.mjs — Run the complete browser gate against a private local release server.
import {spawn,spawnSync} from 'node:child_process';
const {HANDBOOK_TEST_URL:ignoredRemote,...testEnv}=process.env;
const server=spawn(process.execPath,['scripts/serve-checks.mjs'],{stdio:['ignore','pipe','inherit']});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Check server did not start')),10000);server.once('exit',code=>{clearTimeout(timer);reject(Error(`Check server exited ${code}`));});server.stdout.on('data',()=>{clearTimeout(timer);resolve();});});
 for(const test of ['security','browser','curriculum','home-map','build-tools','reading-library','learning-roadmap','troubleshooting','lumen']){
  const result=spawnSync(process.execPath,[`tests/${test}.mjs`],{stdio:'inherit',env:testEnv});if(result.status!==0)throw Error(`${test} failed`);
 }
 const smoke=spawnSync(process.execPath,['scripts/check-production.mjs','http://127.0.0.1:4173'],{stdio:'inherit',env:testEnv});if(smoke.status!==0)throw Error('Release smoke checks failed');
 const stale=spawnSync(process.execPath,['scripts/check-production.mjs','http://127.0.0.1:4173','stale-revision'],{encoding:'utf8',env:testEnv});if(stale.status!==1||!stale.stderr.includes('Production revision differs'))throw Error('Smoke checker failed to reject a stale revision');
}finally{server.kill('SIGTERM');}
