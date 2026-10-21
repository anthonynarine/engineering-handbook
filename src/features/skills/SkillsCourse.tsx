// src/features/skills/SkillsCourse.tsx — Present lesson sections as ordered courses with lesson goals.
import { Link } from 'react-router';
import { articles, type Article } from '../handbook';
import './skills.css';
const courses: Record<string, { name: string; lessons: readonly (readonly [string, string])[] }> = {
 skills: { name: 'SKILLS NEEDED', lessons: [
  ['containers-fundamentals', 'Containers'], ['networking-and-load-balancers', 'Networking & load balancers'],
  ['postgres-performance', 'PostgreSQL performance'], ['caching-and-rate-limiting', 'Caching & rate limiting'],
  ['infrastructure-as-code', 'Infrastructure as code'],
 ] },
 finance: { name: 'FINANCIAL LIBRARIES', lessons: [
  ['plaid-fundamentals', 'How Plaid works'], ['plaid-transaction-sync', 'Plaid sync & webhooks'],
  ['plaid-security-and-failures', 'Plaid security & failures'], ['stripe-fundamentals', 'How Stripe works'],
  ['stripe-webhooks-and-subscriptions', 'Stripe webhooks & subscriptions'],
 ] },
};

export function CoursePath({ section, current }: { section: string; current: string }) {
 const course = courses[section];
 if (!course) return null;
 return <nav className="reports-path skills-path" aria-label={`${course.name.toLowerCase()} course`}><span>{course.name} · {course.lessons.length} LESSONS</span><ol>{course.lessons.map(([slug, title], index) => <li key={slug}><Link to={`/guide/${slug}`} aria-current={slug === current ? 'step' : undefined}><small>{String(index + 1).padStart(2, '0')}</small>{title}</Link></li>)}</ol></nav>;
}

export function LessonCard({ article }: { article: Article }) {
 const lesson = article.lesson;
 if (!lesson) return null;
 const lessons = courses[article.section]?.lessons ?? [];
 const number = lessons.findIndex(([slug]) => slug === article.slug) + 1;
 const prerequisites = lesson.prerequisites.map(slug => articles.find(item => item.slug === slug)!);
 return <section className="lesson-card" aria-label="Lesson overview">
  <div className="lesson-facts">{number > 0 && <span>Lesson {number} of {lessons.length}</span>}<span>{lesson.level}</span><span>About {lesson.duration}</span></div>
  <h2>By the end of this lesson, you can</h2>
  <ul className="lesson-objectives">{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul>
  {prerequisites.length > 0 && <p className="lesson-prerequisites"><strong>Helpful to read first</strong>{prerequisites.map(item => <Link key={item.slug} to={`/guide/${item.slug}`}>{item.title}</Link>)}</p>}
 </section>;
}
