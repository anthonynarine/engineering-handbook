import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router';
import KnowledgeGraph from '../features/handbook/KnowledgeGraph';
import './brain.css';

document.documentElement.dataset.theme='dark';
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/?space=3d']}><KnowledgeGraph art/></MemoryRouter>);
