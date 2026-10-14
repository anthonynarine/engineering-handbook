// src/features/resilience/ResilienceLab.tsx — Present interactive incident decisions without contacting production services.
import { useState } from 'react';
import { Link } from 'react-router';
import { Activity, ArrowRight, CheckCircle2, ShieldCheck, Workflow } from 'lucide-react';
import { drills, type Category } from './scenarios';
import './resilience.css';
export default function ResilienceLab() {
 const [category, setCategory] = useState<Category | 'All'>('All');
 const [active, setActive] = useState(drills[0].id);
 const [answers, setAnswers] = useState<Record<string, number>>({});
 const [exported, setExported] = useState(false);
 const visible = drills.filter(drill => category === 'All' || drill.category === category);
 const drill = drills.find(item => item.id === active)!;
 const answer = answers[drill.id];
 const choice = answer === undefined ? undefined : drill.choices[answer];
 const completed = drills.filter(item => item.choices[answers[item.id]]?.preferred).length;
 function filter(next: Category | 'All') {
  setCategory(next); setExported(false);
  if (next !== 'All' && drill.category !== next) setActive(drills.find(item => item.category === next)!.id);
 }
 function downloadNotes() {
  const text = ['# Resilience exercise notes', '', 'Synthetic learning exercise only. No real security, worker, backup, or AI checks were executed.', '', `Preferred decisions selected: ${completed}/${drills.length}. This is learning progress, not an application verification score.`, '', ...drills.filter(item => answers[item.id] !== undefined).flatMap(item => [
   `## ${item.title}`, '', `Selected decision: ${item.choices[answers[item.id]].label}`, '', item.choices[answers[item.id]].consequence, '', 'Proposed checks — not executed:', '', ...item.evidence.map(check => `- [ ] ${check}`), '', `Read: /guide/${item.guide}`, '',
  ])].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'resilience-exercise-notes.md'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); setExported(true);
 }
 const icon = drill.category === 'Security' ? ShieldCheck : drill.category === 'Operations' ? Activity : Workflow;
 const Icon = icon;
 return <div className="resilience-lab"><header className="article-header"><div className="eyebrow">SECURITY / OPERATIONS / AI</div><h1>Practice the failure path.</h1><p className="article-summary">Eight incidents. Make a decision, see its consequence, and identify the evidence a real system needs.</p><p className="lab-notice">This is a synthetic decision exercise. It does not run authentication checks, workers, restores, or AI calls. Progress records your choices while this lab is open and resets when you leave or reload it.</p></header><div className="drill-toolbar"><div className="drill-filters" role="group" aria-label="Filter incident drills">{(['All', 'Security', 'Operations', 'AI'] as const).map(item => <button key={item} aria-pressed={category === item} onClick={() => filter(item)}>{item}</button>)}</div><span className="drill-progress" role="status" aria-label="Learning progress">{completed} / {drills.length} preferred decisions</span></div><div className="drill-layout"><nav className="drill-list" aria-label="Incident scenarios">{visible.map((item, i) => <button key={item.id} aria-current={item.id === active ? 'step' : undefined} onClick={() => { setActive(item.id); setExported(false); }}><span>{String(i + 1).padStart(2, '0')} / {item.category}</span><strong>{item.title}</strong>{item.choices[answers[item.id]]?.preferred && <CheckCircle2 size={16} aria-label="Preferred decision selected"/>}</button>)}</nav><section className="drill-panel" aria-labelledby="drill-title"><div className="drill-kicker"><Icon size={16}/>{drill.category} drill<span>{drill.signal}</span></div><h2 id="drill-title">{drill.title}</h2><p>{drill.context}</p><div className="drill-boundary"><small>BOUNDARY TO PRESERVE</small><strong>{drill.boundary}</strong></div><fieldset className="drill-choices"><legend>Choose your next action</legend>{drill.choices.map((item, i) => <button key={item.label} aria-pressed={answer === i} onClick={() => { setAnswers(previous => ({ ...previous, [drill.id]: i })); setExported(false); }}><span>{String.fromCharCode(65 + i)}</span>{item.label}<ArrowRight size={15}/></button>)}</fieldset>{choice && <div className={`drill-result ${choice.preferred ? 'preferred' : 'reconsider'}`} role="status" aria-label="Decision consequence"><strong>{choice.preferred ? 'Preferred approach for this scenario' : 'Reconsider this approach'}</strong><p>{choice.consequence}</p></div>}<div className="drill-evidence"><h3>Evidence to collect in the real application</h3><p>These checks are proposed, not executed by this lab.</p><ul>{drill.evidence.map(item => <li key={item}>{item}</li>)}</ul><Link className="text-link" to={`/guide/${drill.guide}`}>Read the implementation drill <ArrowRight size={15}/></Link></div></section></div><footer className="drill-footer"><p>Bring the decision and proposed checks into the owning application’s Foundry task. Attach actual execution results separately.</p><div><button className="primary" onClick={downloadNotes} disabled={!Object.keys(answers).length}>Download exercise notes</button><button className="text-link" onClick={() => { setAnswers({}); setExported(false); }}>Reset progress</button></div>{exported && <p role="status">Exercise notes downloaded. All real-application checks are marked unexecuted.</p>}</footer></div>;
}
