import {Layers,Workflow,Server,Monitor,ShieldCheck,Sparkles,Cloud,FolderKanban,type LucideIcon} from 'lucide-react';
// The same symbol identifies a section and every guide belonging to it.
export const graphSections:Record<string,{icon:LucideIcon;color:string;core:string}>={
 start:{icon:Layers,color:'#a1a1aa',core:'build-manual'},
 foundry:{icon:Workflow,color:'#a78bfa',core:'foundry-repository'},
 server:{icon:Server,color:'#60a5fa',core:'django-toolkit'},
 client:{icon:Monitor,color:'#22d3ee',core:'frontend-architecture'},
 security:{icon:ShieldCheck,color:'#4ade80',core:'security-boundaries'},
 ai:{icon:Sparkles,color:'#e879f9',core:'deterministic-ai'},
 operations:{icon:Cloud,color:'#fbbf24',core:'ci-cd-release-workflow'},
 projects:{icon:FolderKanban,color:'#fb923c',core:'lumen-platform-design'},
};
export const sectionCenter=(section:string)=>{const index=Object.keys(graphSections).indexOf(section);const angle=index*Math.PI/4-Math.PI/2;return {x:500+Math.cos(angle)*175,y:370+Math.sin(angle)*175};};
