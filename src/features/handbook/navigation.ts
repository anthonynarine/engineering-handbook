// src/features/handbook/navigation.ts — Assign each guide one primary home in the build manual.
import type { Article } from './index';
export const navigationSections = [
 {id:'start',name:'Start here'}, {id:'foundry',name:'Foundry'},
 {id:'server',name:'Backend'}, {id:'client',name:'Frontend'},
 {id:'security',name:'Security'}, {id:'ai',name:'AI'},
 {id:'operations',name:'Cloud & CI/CD'}, {id:'projects',name:'Projects'},
];
export function navigationSection(article:Pick<Article,'slug'|'section'>):string {
 if(['full-stack-folder-structure','frontend-folder-structure'].includes(article.slug))return 'start';
 if(['recipe-add-endpoint','recipe-scheduled-task'].includes(article.slug))return 'server';
 if(['recipe-live-events','recipe-query-mutation'].includes(article.slug))return 'client';
 if(['recipe-protect-screen','recipe-private-document'].includes(article.slug))return 'security';
 if(article.slug==='troubleshoot-background-jobs')return 'server';
 if(article.slug==='django-cors')return 'security';
 if(article.slug==='reliable-job-lifecycle')return 'server';
 return ({system:'start',walkthrough:'start',django:'server',react:'client',deployment:'operations'} as Record<string,string>)[article.section]??article.section;
}
export function navigationLabel(article:Pick<Article,'slug'|'section'>):string {
 return navigationSections.find(section=>section.id===navigationSection(article))?.name??article.section;
}

export function navigationGroups(section:string,guides:Pick<Article,'slug'>[]) {
 const matching=(prefix:string)=>guides.filter(article=>article.slug.startsWith(prefix)).map(article=>article.slug);
 const groups=section==='start'?[
  {name:'Git essentials',slugs:['git-basics','git-command-reference']},
  {name:'Project structure',slugs:['full-stack-folder-structure','frontend-folder-structure']},
  {name:'Build a complete feature',slugs:['reports-contract','reports-data','reports-api','reports-react','reports-verification','reports-release']},
 ]:section==='foundry'?[
  {name:'Setup tutorial',slugs:['foundry-repository','foundry-installation','foundry-initialization','foundry-human-authority','foundry-sessions','foundry-first-task','foundry-review-release','foundry-github-recovery']},
 ]:section==='server'?[
  {name:'Getting started',slugs:['django-setup','django-first-api']},
  {name:'Core tools',slugs:['django-models-orm','api-contracts','safe-database-migrations','django-views','django-rest-boundaries','services-and-selectors','django-middleware','django-signals','websocket-design','django-channels']},
  {name:'Jobs & testing',slugs:['reliable-job-lifecycle','django-testing-delivery','testing-strategy']},
 ]:section==='ai'?[
  {name:'Learn the concepts',slugs:['mcp-fundamentals']},
 ]:section==='security'?[
  {name:'Learn the standards',slugs:['security-standards-fundamentals','nist-fundamentals','owasp-fundamentals']},
 ]:section==='operations'?[
  {name:'Learn the concepts',slugs:['ci-cd-fundamentals']},
  {name:'Hosting & cloud design',slugs:['deployment-platforms']},
  {name:'CI/CD & releases',slugs:['ci-cd-release-workflow']},
  {name:'Heroku field guide',slugs:['heroku-django-deployment','heroku-operations']},
  {name:'Backups & recovery',slugs:['backup-and-scheduled-tasks','operational-runbooks','recovery-runbook']},
 ]:[];
 if(['server','client','security'].includes(section))groups.push({name:'Build recipes',slugs:matching('recipe-')});
 groups.push({name:'Troubleshooting',slugs:matching('troubleshoot-')});
 return groups.map(group=>({...group,slugs:group.slugs.filter(slug=>guides.some(article=>article.slug===slug))})).filter(group=>group.slugs.length);
}
export function guideSequence(article:Article,all:Article[]):Article[] {
 const section=navigationSection(article);const guides=all.filter(item=>navigationSection(item)===section);
 const group=navigationGroups(section,guides).find(group=>group.slugs.includes(article.slug));
 const ids=group?.slugs??guides.filter(item=>!navigationGroups(section,guides).some(group=>group.slugs.includes(item.slug))).map(item=>item.slug);
 return ids.map(id=>all.find(item=>item.slug===id)!);
}
