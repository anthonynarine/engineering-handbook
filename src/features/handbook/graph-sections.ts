import {Layers,Workflow,Server,Monitor,ShieldCheck,Sparkles,Cloud,FolderKanban,Radar,GraduationCap,Landmark,type LucideIcon} from 'lucide-react';
// The same symbol identifies a section and every guide belonging to it.
export const graphSections:Record<string,{icon:LucideIcon;color:string;core:string}>={
 start:{icon:Layers,color:'#a1a1aa',core:'build-manual'},
 foundry:{icon:Workflow,color:'#a78bfa',core:'foundry-repository'},
 server:{icon:Server,color:'#60a5fa',core:'django-toolkit'},
 client:{icon:Monitor,color:'#22d3ee',core:'frontend-architecture'},
 security:{icon:ShieldCheck,color:'#4ade80',core:'security-boundaries'},
 observability:{icon:Radar,color:'#f87171',core:'observability-and-security-monitoring'},
 ai:{icon:Sparkles,color:'#e879f9',core:'deterministic-ai'},
 operations:{icon:Cloud,color:'#fbbf24',core:'ci-cd-release-workflow'},
 projects:{icon:FolderKanban,color:'#fb923c',core:'lumen-platform-design'},
 skills:{icon:GraduationCap,color:'#a3e635',core:'skills-gap-map'},
 finance:{icon:Landmark,color:'#2dd4bf',core:'financial-libraries'},
};
export const sectionCenter=(section:string)=>{const index=Object.keys(graphSections).indexOf(section);const angle=index*2*Math.PI/Object.keys(graphSections).length-Math.PI/2;return {x:500+Math.cos(angle)*175,y:370+Math.sin(angle)*175};};
