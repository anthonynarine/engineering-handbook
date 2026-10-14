// src/features/handbook/navigation.ts — Assign each guide one primary home in the build manual.
import type { Article } from './index';
export const navigationSections = [
 {id:'start',name:'Start here'}, {id:'foundry',name:'Foundry'},
 {id:'server',name:'Server'}, {id:'client',name:'Client'},
 {id:'security',name:'Security'}, {id:'ai',name:'AI'},
 {id:'operations',name:'Deployment & operations'}, {id:'projects',name:'Projects'},
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
