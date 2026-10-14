// src/features/foundry-tutorial/FoundryPath.tsx — Connect the eight repository-to-release Foundry tutorial chapters.
import { Link } from 'react-router';
export const foundryChapters = [
 ['foundry-repository', 'Create & open the repo'], ['foundry-installation', 'Install Foundry'],
 ['foundry-initialization', 'Initialize the project'], ['foundry-human-authority', 'Register the owner'],
 ['foundry-sessions', 'Start an agent session'], ['foundry-first-task', 'Run the first task'],
 ['foundry-review-release', 'Review & release'], ['foundry-github-recovery', 'GitHub & recovery'],
] as const;
export default function FoundryPath({ current }: { current: string }) {
 return <nav className="reports-path foundry-path" aria-label="Foundry setup tutorial"><span>FOUNDRY FROM ZERO · EIGHT CHAPTERS</span><ol>{foundryChapters.map(([slug, title], index) => <li key={slug}><Link to={`/guide/${slug}`} aria-current={slug === current ? 'step' : undefined}><small>{String(index + 1).padStart(2, '0')}</small>{title}</Link></li>)}</ol><p className="foundry-path-note">Follow in order. Each chapter identifies the terminal or chat to use, expected results, and a checkpoint.</p></nav>;
}
