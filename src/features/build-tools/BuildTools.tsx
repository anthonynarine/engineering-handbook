// src/features/build-tools/BuildTools.tsx — Provide local, self-reported startup progress and searchable recipes.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import './build-tools.css';
type Stack='frontend'|'fullstack';
const common=[
 {id:'scope',stage:'Plan',title:'Define the first useful slice',detail:'Write the outcome, scope and acceptance checks.',guide:'build-manual'},
 {id:'foundry',stage:'Plan',title:'Initialize the build workflow',detail:'Create the repository and set up Foundry for scoped work.',guide:'foundry-repository'},
];
const steps=(stack:Stack)=>[...common,
 {id:'layout',stage:'Set up',title:'Create the repository structure',detail:stack==='frontend'?'Standalone React project, one ignore file.':'One repository, backend and frontend, three ignore files.',guide:stack==='frontend'?'frontend-folder-structure':'full-stack-folder-structure'},
 ...(stack==='fullstack'?[
 {id:'backend',stage:'Set up',title:'Create the Django environment and app',detail:'Register the nested app, record dependencies and run framework checks.',guide:'django-setup'},
 {id:'api',stage:'Build',title:'Deliver one protected API operation',detail:'Model, migrate, validate input and scope access.',guide:'django-first-api'},
 {id:'connect',stage:'Build',title:'Connect React to the API',detail:'Axios transport, query keys, session policy and server state.',guide:'react-api-connection'},
 {id:'security',stage:'Protect',title:'Verify identity and permissions',detail:'Test foreign records and tenant scope where applicable.',guide:'django-rest-boundaries'},
 {id:'cors',stage:'Protect',title:'Decide browser origin and CSRF policy',detail:'Choose proxy or direct-origin routing for each environment.',guide:'django-cors'},
 ]:[{id:'interface',stage:'Build',title:'Build one complete interface flow',detail:'Handle keyboard, loading, empty and error states where applicable.',guide:'frontend-architecture'}]),
 {id:'verify',stage:'Verify',title:'Run the relevant checks',detail:stack==='fullstack'?'API isolation, validation, migrations and frontend behavior.':'Production build, keyboard navigation, mobile layout and direct route reload.',guide:stack==='fullstack'?'django-testing-delivery':'frontend-folder-structure'},
 {id:'review',stage:'Release',title:'Review the exact candidate',detail:'Record executed checks and resolve required review findings.',guide:'foundry-review-release'},
 {id:'deploy',stage:'Release',title:'Deploy and verify the live application',detail:'Configure the host and verify the real deployed routes.',guide:'deployment-platforms'},
 ...(stack==='fullstack'?[{id:'recovery',stage:'Operate',title:'Verify backup, schedules and recovery',detail:'Check actual outcomes and restore evidence for the services you use.',guide:'recovery-runbook'}]:[]),
];
const storageKey='handbook-build-checklist-v1';
function readProgress():Record<Stack,string[]> {
 try {const raw=JSON.parse(localStorage.getItem(storageKey)??'{}');return Object.fromEntries((['frontend','fullstack'] as Stack[]).map(stack=>[stack,Array.isArray(raw?.[stack])?[...new Set(raw[stack].filter((id:unknown)=>typeof id==='string'&&steps(stack).some(step=>step.id===id)))]:[]])) as Record<Stack,string[]>;}catch{return {frontend:[],fullstack:[]};}
}
export function StarterChecklist(){
 const [params,setParams]=useSearchParams();const stack:Stack=params.get('stack')==='fullstack'?'fullstack':'frontend';
 const [progress,setProgress]=useState(readProgress);const [storageState,setStorageState]=useState('Progress stays in this browser when storage is available.');
 const current=steps(stack);const selected=progress[stack];const count=current.filter(step=>selected.includes(step.id)).length;
 function save(ids:string[]){const next={...progress,[stack]:ids};setProgress(next);try{localStorage.setItem(storageKey,JSON.stringify(next));setStorageState('Saved in this browser.');}catch{setStorageState('Browser storage is unavailable; progress lasts only while this page stays open.');}}
 function changeStack(value:Stack){const next=new URLSearchParams(params);next.set('stack',value);setParams(next,{replace:true});}
 function download(){const text=['# Project starter checklist',`Project type: ${stack}`,`Exported: ${new Date().toISOString()}`,'','Self-reported progress only. No commands, tests or deployment checks were executed by the handbook.','',...current.map(step=>`- [${selected.includes(step.id)?'x':' '}] ${step.title}\n  Guide: /guide/${step.guide}`)].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/markdown'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`${stack}-starter-checklist.md`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="build-tool" aria-label="Project starter checklist"><fieldset className="stack-choice"><legend>What are you building?</legend>{([{id:'frontend',label:'Frontend only',detail:'React and static hosting'},{id:'fullstack',label:'Full-stack',detail:'Django API and React'}] as const).map(option=><label key={option.id}><input type="radio" name="project-type" checked={stack===option.id} onChange={()=>changeStack(option.id)}/><span><strong>{option.label}</strong><small>{option.detail}</small></span></label>)}</fieldset>
 <div className="build-progress"><strong role="status">{count} of {current.length} steps marked complete</strong><progress max={current.length} value={count} aria-label="Self-reported checklist progress"/><small>{storageState}</small></div>
 {count===current.length&&<p className="build-completion">All steps marked complete. Confirm your application's actual test and release evidence before shipping.</p>}
 {[...new Set(current.map(step=>step.stage))].map(stage=><div className="checklist-stage" key={stage}><h2>{stage}</h2>{current.filter(step=>step.stage===stage).map(step=><div className="build-step" key={step.id}><label><input type="checkbox" checked={selected.includes(step.id)} onChange={()=>save(selected.includes(step.id)?selected.filter(id=>id!==step.id):[...selected,step.id])}/><span><strong>{step.title}</strong><small>{step.detail}</small></span></label><Link to={`/guide/${step.guide}`}>Open guide →</Link></div>)}</div>)}
 <div className="build-tool-actions"><button type="button" onClick={download}>Export checklist</button><button type="button" disabled={count===0} onClick={()=>save([])}>Reset {stack==='frontend'?'frontend':'full-stack'} progress</button></div><p className="build-tool-note">Self-reported planning aid · No application checks run here.</p></section>;
}
export const recipes=[
 {slug:'recipe-add-endpoint',title:'Add a protected REST endpoint',category:'Server',detail:'Scoped query, serializer and explicit HTTP method.',tags:'django drf api views'},
 {slug:'recipe-protect-screen',title:'Protect a React screen',category:'Security',detail:'Session loading, denial and navigation boundaries.',tags:'route login auth client'},
 {slug:'recipe-private-document',title:'Retrieve a private document',category:'Security',detail:'Authorized file bytes and browser preview cleanup.',tags:'upload download file blob storage s3'},
 {slug:'recipe-scheduled-task',title:'Add scheduled backend work',category:'Server',detail:'Management command, scheduler and reliable job boundary.',tags:'cron jobs backup worker'},
 {slug:'recipe-live-events',title:'Connect a live event stream',category:'Client',detail:'Socket lifecycle and scoped query invalidation.',tags:'websocket channels realtime react'},
 {slug:'recipe-query-mutation',title:'Refresh queries after a write',category:'Client',detail:'Axios mutation and tenant-aware cache refresh.',tags:'tanstack query cache axios post'},
];
export function RecipeDirectory(){
 const [params,setParams]=useSearchParams();const query=params.get('q')??'';const category=params.get('category')??'All';
 const visible=recipes.filter(recipe=>(category==='All'||recipe.category===category)&&`${recipe.title} ${recipe.detail} ${recipe.tags}`.toLowerCase().includes(query.trim().toLowerCase()));
 function filter(key:string,value:string){const next=new URLSearchParams(params);if(value&&value!=='All')next.set(key,value);else next.delete(key);setParams(next,{replace:true});}
 return <section className="build-tool" aria-label="Build recipe directory"><label className="recipe-search" htmlFor="recipe-search">Find a task<input id="recipe-search" type="search" value={query} placeholder="Try WebSocket, endpoint, file, or query…" onChange={event=>filter('q',event.target.value)}/></label><div className="recipe-filters" role="group" aria-label="Recipe categories">{['All','Server','Client','Security'].map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>filter('category',value)}>{value}</button>)}</div><p role="status">{visible.length} of {recipes.length} recipes</p><div className="recipe-grid">{visible.map(recipe=><Link className="recipe-card" key={recipe.slug} to={`/guide/${recipe.slug}`}><small>{recipe.category} / RECIPE</small><h2>{recipe.title}</h2><p>{recipe.detail}</p><span>Steps, excerpt & verification →</span></Link>)}</div>{visible.length===0&&<div className="recipe-empty"><p>No recipes match those filters.</p><button type="button" onClick={()=>setParams({}, {replace:true})}>Clear recipe filters</button></div>}</section>;
}
