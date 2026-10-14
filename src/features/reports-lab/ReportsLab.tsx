// src/features/reports-lab/ReportsLab.tsx — Exercise a synthetic Reports contract in browser memory.
import { useState } from 'react';
import { Link } from 'react-router';
import './reports-lab.css';
type Tenant = 'north' | 'south';
type Role = 'editor' | 'viewer' | 'outsider';
type Report = { id: string; tenant: Tenant; title: string; status: 'draft'; creationKey: string };
type Attempt = { tenant: Tenant; title: string; creationKey: string };
const seed = (): Report[] => [
 { id: 'north-example', tenant: 'north', title: 'North · monthly overview', status: 'draft', creationKey: 'seed-north' },
 { id: 'south-example', tenant: 'south', title: 'South · maintenance summary', status: 'draft', creationKey: 'seed-south' },
];
export const chapters = [
 ['reports-contract', 'Contract & Foundry'], ['reports-data', 'Models & migrations'],
 ['reports-api', 'Services & API'], ['reports-react', 'React & cache'],
 ['reports-verification', 'Tests & failure lab'], ['reports-release', 'Release & extensions'],
] as const;
export function ReportsPath({ current }: { current?: string }) {
 return <nav className="reports-path" aria-label="Reports learning path"><span>BUILD ONE FEATURE · SIX CHAPTERS</span><ol>{chapters.map(([slug, title], i) => <li key={slug}><Link to={`/guide/${slug}`} aria-current={current === slug ? 'step' : undefined}><small>{String(i + 1).padStart(2, '0')}</small>{title}</Link></li>)}</ol><Link className="text-link" to="/lab/reports">Open the interactive Reports lab →</Link></nav>;
}
export default function ReportsLab() {
 const [tenant, setTenant] = useState<Tenant>('north');
 const [role, setRole] = useState<Role>('editor');
 const [reports, setReports] = useState<Report[]>(seed);
 const [title, setTitle] = useState('Quarterly portfolio review');
 const [loseResponse, setLoseResponse] = useState(false);
 const [attempt, setAttempt] = useState<Attempt | null>(null);
 const [selected, setSelected] = useState<Report | null>(null);
 const [events, setEvents] = useState<string[]>(['200 GET /reports/ · North scope · 1 result']);
 const [feedback, setFeedback] = useState('Ready to create a draft.');
 const log = (message: string) => { setFeedback(message); setEvents(previous => [message, ...previous].slice(0, 12)); };
 const visible = role === 'outsider' ? [] : reports.filter(report => report.tenant === tenant);
 function create(input: Attempt, dropResponse: boolean) {
  setAttempt(input); setSelected(null);
  if (input.tenant !== tenant) { log('409 · Workspace changed. Start a new request in this workspace.'); return; }
  if (role !== 'editor') { log('403 · Active editor membership required. No report created.'); return; }
  if (!input.title.trim() || input.title.trim().length > 120) { log('400 · Title must contain 1–120 characters.'); return; }
  const existing = reports.find(report => report.tenant === input.tenant && report.creationKey === input.creationKey);
  if (existing && existing.title !== input.title.trim()) { log('409 · Creation key already used with a different title.'); return; }
  if (existing) { log('200 · Replay returned the same report. No duplicate created.'); return; }
  const report: Report = { ...input, id: crypto.randomUUID(), title: input.title.trim(), status: 'draft' };
  setReports(previous => [...previous, report]);
  if (dropResponse) { log('503 simulated · Draft committed, response lost. Retry with the same key.'); return; }
  log('201 · Draft created. Refreshed the active tenant list.');
 }
 // The simulated actor is fixed; role changes represent membership changes for that actor.
 function openDetail(id: string) {
  setSelected(null);
  if (role === 'outsider') { log('403 · Membership denied before object lookup.'); return; }
  const found = reports.find(report => report.tenant === tenant && report.id === id);
  if (!found) { log('404 · Other-tenant report absent from the scoped queryset.'); return; }
  setSelected(found); log('200 · Detail resolved inside the active tenant scope.');
 }
 function changeScope(next: Tenant, nextRole: Role) {
  setTenant(next); setRole(nextRole); setSelected(null); setAttempt(null);
  log(nextRole === 'outsider' ? '403 GET /reports/ · No active membership. List cleared.' : `200 GET /reports/ · ${next} scope · Detail and pending request cleared.`);
 }
 return <div className="reports-lab"><header className="article-header"><div className="eyebrow">FEATURE WALKTHROUGH / INTERACTIVE LAB</div><h1>One feature. Every boundary.</h1><p className="article-summary">Create a report, switch workspaces, and inspect what happens when a request fails after the write.</p><p className="lab-notice"><strong>Browser-only teaching simulation.</strong> Synthetic data lives in memory and resets on reload. These controls simulate API decisions; real authentication, tenant enforcement, PostgreSQL transactions, and network requests are described in the chapters.</p></header><ReportsPath/><div className="lab-controls"><label>Workspace<select aria-label="Workspace" value={tenant} onChange={e => changeScope(e.target.value as Tenant, role)}><option value="north">North workspace</option><option value="south">South workspace</option></select></label><label>Membership<select aria-label="Membership" value={role} onChange={e => changeScope(tenant, e.target.value as Role)}><option value="editor">Active editor</option><option value="viewer">Active viewer</option><option value="outsider">No membership</option></select></label><button className="text-link" onClick={() => { setReports(seed()); setAttempt(null); setSelected(null); setLoseResponse(false); log('Reset · Synthetic examples restored.'); }}>Reset lab</button></div><div className="lab-grid"><section className="lab-panel"><span className="eyebrow">01 / COMMAND</span><h2>Create a draft</h2><form onSubmit={e => { e.preventDefault(); create({ tenant, title, creationKey: crypto.randomUUID() }, loseResponse); }}><label>Report title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}/></label><label className="lab-checkbox"><input type="checkbox" checked={loseResponse} onChange={e => setLoseResponse(e.target.checked)}/>Lose the response after commit</label><button className="primary" type="submit">Create report</button></form><p className="lab-hint">Keep the button available as a viewer to see the simulated API reject a write.</p><div className="lab-actions"><button disabled={!attempt} onClick={() => attempt && create(attempt, false)}>Retry same request</button><button disabled={!attempt} onClick={() => attempt && create({ ...attempt, title: `${attempt.title} changed` }, false)}>Reuse key with changed title</button></div><p role="status" className="lab-feedback">{feedback}</p></section><section className="lab-panel"><span className="eyebrow">02 / READ MODEL</span><h2>Workspace reports <small data-testid="report-count">{visible.length}</small></h2><ul className="lab-reports">{visible.map(report => <li key={report.id}><button onClick={() => openDetail(report.id)}><strong>{report.title}</strong><span>DRAFT · Open detail →</span></button></li>)}</ul>{!visible.length && <p>No reports visible in this scope.</p>}<button className="text-link" onClick={() => openDetail(reports.find(report => report.tenant !== tenant)!.id)}>Try another tenant’s report ID →</button>{selected && <div className="lab-detail"><h3>{selected.title}</h3><p>Status: {selected.status}</p><code>{selected.id}</code></div>}</section></div><section className="lab-panel lab-trace"><span className="eyebrow">03 / OBSERVABILITY</span><h2>Request trace</h2><p>No real HTTP calls occur here. The trace shows the contract’s intended responses.</p>{attempt && <details><summary>Inspect the last command</summary><pre>{JSON.stringify({ method: 'POST', path: '/api/v1/reports/', headers: { 'X-Org-Slug': attempt.tenant }, body: { title: attempt.title, creationKey: attempt.creationKey } }, null, 2)}</pre></details>}<ol>{events.map((event, i) => <li key={`${i}-${event}`}><code>{event}</code></li>)}</ol></section></div>;
}
