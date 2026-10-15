// Render ordered topic groups; direct links open their containing group.
import { NavLink } from 'react-router';
import { articles } from './index';
import { navigationSection, navigationGroups } from './navigation';
export default function SectionNavigation({section,slug}:{section:string;slug?:string}) {
 const guides=articles.filter(article=>navigationSection(article)===section);
 const groups=navigationGroups(section,guides);
 const grouped=new Set(groups.flatMap(group=>group.slugs));
 return <>{guides.filter(article=>!grouped.has(article.slug)).map(article=><NavLink key={article.slug} to={`/guide/${article.slug}`}>{article.title}</NavLink>)}{groups.map(group=><details className="curriculum-group" key={group.name} open={group.slugs.includes(slug??'')}><summary>{group.name}</summary>{group.slugs.map(id=><NavLink key={id} to={`/guide/${id}`}>{articles.find(article=>article.slug===id)!.title}</NavLink>)}</details>)}</>;
}
