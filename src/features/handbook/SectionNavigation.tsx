// src/features/handbook/SectionNavigation.tsx — Render focused subgroups without duplicating guide homes.
import { NavLink } from 'react-router';
import { articles } from './index';
import { navigationSection } from './navigation';
const serverGroups = [
 {name:'Getting started',slugs:['django-setup','django-first-api']},
 {name:'Core tools',slugs:['django-models-orm','api-contracts','safe-database-migrations','django-views','django-rest-boundaries','services-and-selectors','django-middleware','django-signals','websocket-design','django-channels']},
 {name:'Jobs & testing',slugs:['reliable-job-lifecycle','django-testing-delivery','testing-strategy']},
];
export default function SectionNavigation({section,slug}:{section:string;slug?:string}) {
 const guides=articles.filter(article=>navigationSection(article)===section);
 const recipeGroup={name:'Build recipes',slugs:guides.filter(article=>article.slug.startsWith('recipe-')).map(article=>article.slug)};
 const baseGroups=section==='server'?[...serverGroups,recipeGroup]:section==='client'||section==='security'?[recipeGroup]:section==='start'?[{name:'Build a complete feature',slugs:guides.filter(article=>article.section==='walkthrough').map(article=>article.slug)}]:[];
 const diagnosticGroup={name:'Troubleshooting',slugs:guides.filter(article=>article.slug.startsWith('troubleshoot-')).map(article=>article.slug)};
 const groups=diagnosticGroup.slugs.length?[...baseGroups,diagnosticGroup]:baseGroups;
 const grouped=new Set(groups.flatMap(group=>group.slugs));
 return <>{guides.filter(article=>!grouped.has(article.slug)).map(article=><NavLink key={article.slug} to={`/guide/${article.slug}`}>{article.title}</NavLink>)}{groups.map(group=><details className="curriculum-group" key={group.name} open={group.slugs.includes(slug??'')}><summary>{group.name}</summary>{group.slugs.map(id=><NavLink key={id} to={`/guide/${id}`}>{articles.find(article=>article.slug===id)!.title}</NavLink>)}</details>)}</>;
}
