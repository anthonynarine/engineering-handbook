// src/features/skills/SkillsCourse.tsx — Present the Skills needed lessons as an ordered course with lesson goals.
import { Link } from 'react-router';
import { articles, type Article } from '../handbook';
import './skills.css';
export const skillLessons = [
 ['containers-fundamentals', 'Containers'], ['networking-and-load-balancers', 'Networking & load balancers'],
 ['postgres-performance', 'PostgreSQL performance'], ['caching-and-rate-limiting', 'Caching & rate limiting'],
 ['infrastructure-as-code', 'Infrastructure as code'],
] as const;

export function SkillsPath({ current }: { current: string }) {
 return <nav className="reports-path skills-path" aria-label="Skills course"><span>SKILLS NEEDED · {skillLessons.length} LESSONS</span><ol>{skillLessons.map(([slug, title], index) => <li key={slug}><Link to={`/guide/${slug}`} aria-current={slug === current ? 'step' : undefined}><small>{String(index + 1).padStart(2, '0')}</small>{title}</Link></li>)}</ol></nav>;
}

export function LessonCard({ article }: { article: Article }) {
 const lesson = article.lesson;
 if (!lesson) return null;
 const number = skillLessons.findIndex(([slug]) => slug === article.slug) + 1;
 const prerequisites = lesson.prerequisites.map(slug => articles.find(item => item.slug === slug)!);
 return <section className="lesson-card" aria-label="Lesson overview">
  <div className="lesson-facts">{number > 0 && <span>Lesson {number} of {skillLessons.length}</span>}<span>{lesson.level}</span><span>About {lesson.duration}</span></div>
  <h2>By the end of this lesson, you can</h2>
  <ul className="lesson-objectives">{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul>
  {prerequisites.length > 0 && <p className="lesson-prerequisites"><strong>Helpful to read first</strong>{prerequisites.map(item => <Link key={item.slug} to={`/guide/${item.slug}`}>{item.title}</Link>)}</p>}
 </section>;
}
