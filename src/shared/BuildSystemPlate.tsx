// src/shared/BuildSystemPlate.tsx — Link the engineering workflow to the application it produces.
import { useId } from 'react';
import { Link } from 'react-router';
import { UserRound, Workflow, Bot, Monitor, Server, Database, Radio, ListChecks, Sparkles, ShieldCheck, Cloud, type LucideIcon } from 'lucide-react';
export const buildSystemSource = `flowchart TB
%% handbook-home
    Owner[Anthony: intent and acceptance] --> Foundry[Foundry: plan and coordinate]
    Foundry --> Agents[Agents: scoped implementation]
    Agents --> Review[Review evidence and human approval]
    Review --> Release[Build and deploy the accepted revision]
    Release --> Client[Client: React and server-state cache]
    Release --> Server[Django API: domain rules and permissions]
    Client -->|HTTPS| Server
    Server --> Data[Database and private files]
    Server -. optional .-> Realtime[WebSockets]
    Server -. optional .-> Jobs[Background jobs]
    Server -. optional .-> AI[Scoped AI adapters]
    Security[Security across every boundary] -.-> Client
    Security -.-> Server
    Operations[Deployment, monitoring and recovery] -.-> Release`;
function Card({x,y,title,detail,href,icon:Icon,color='blue'}:{x:number;y:number;title:string;detail:string;href:string;icon:LucideIcon;color?:string}) {
 return <Link to={href} aria-label={title}><g className={`plate-node ${color}`}><rect x={x} y={y} width="260" height="88" rx="14"/><rect className="icon-tile" x={x+15} y={y+21} width="38" height="38" rx="10"/><svg x={x+24} y={y+30} width="20" height="20" viewBox="0 0 24 24"><Icon/></svg><text className="plate-title" x={x+66} y={y+37}>{title}</text><text className="plate-detail" x={x+66} y={y+59}>{detail}</text></g></Link>;
}
export default function BuildSystemPlate(){
 const id='build-map-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const wire=(d:string,dashed=false)=><path className={`plate-wire ${dashed?'dashed':''}`} d={d} markerEnd={`url(#${id}-arrow)`}/>;
 return <svg className="architecture-plate build-system-plate" viewBox="0 0 1000 870" role="img" aria-labelledby={`${id}-title ${id}-description`}>
 <title id={`${id}-title`}>From Foundry and agents to a running application</title><desc id={`${id}-description`}>Anthony sets the outcome. Foundry coordinates scoped agent work. Review evidence and human approval precede deployment of an accepted revision. The runtime connects React to Django and its database or private files. WebSockets, background jobs and AI are optional capabilities. Security and deployment operations support the system. Arrows above the runtime represent delivery, not live user requests. Each component links to its manual chapter.</desc>
 <defs><pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#9aaec5"/></pattern><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8494ae"/></marker></defs>
 <rect width="1000" height="870" fill="#f5f8fc"/><rect width="1000" height="870" fill={`url(#${id}-grid)`} opacity=".45"/>
 <text x="40" y="37" className="plate-kicker">THE MASTER BUILD MAP / FOLLOW THE RESPONSIBILITIES</text>
 <text x="40" y="73" className="plate-heading">You direct. Agents build. Your application runs.</text>
 <text x="40" y="99" className="plate-subheading">Two connected systems: the workflow that builds software, and the runtime that serves users.</text>
 <rect className="plate-zone" x="24" y="124" width="952" height="225" rx="20"/>
 <text x="44" y="152" className="plate-zone-label">01 / BUILD — FOUNDRY & AGENTS</text>
 <Card x={45} y={173} title="Anthony" detail="Intent · scope · acceptance" href="/guide/build-manual" icon={UserRound} color="neutral"/>
 <Card x={370} y={173} title="Foundry" detail="Plan · coordinate · recover" href="/guide/building-with-foundry" icon={Workflow}/>
 <Card x={695} y={173} title="Agent workstreams" detail="Implement · test · submit" href="/guide/foundry-first-task" icon={Bot}/>
 {wire('M305 217H370')}{wire('M630 217H695')}
 {wire('M825 261V287H500V298')}
 <Link to="/guide/foundry-review-release" aria-label="Review and release"><rect className="build-review-bar" x="225" y="298" width="550" height="34" rx="10"/><text className="plate-zone-label" textAnchor="middle" x="500" y="320">EVIDENCE → HUMAN APPROVAL → ACCEPTED REVISION</text></Link>
 {wire('M500 332V392')}
 <text className="plate-edge-label" x="519" y="376">build & deploy</text>
 <rect className="plate-zone" x="24" y="392" width="952" height="310" rx="20"/>
 <text x="44" y="421" className="plate-zone-label">02 / RUN — THE APPLICATION YOU BUILD</text>
 <Card x={45} y={443} title="Client" detail="React · Axios · Query cache" href="/guide/frontend-architecture" icon={Monitor} color="teal"/>
 <Card x={370} y={443} title="Server" detail="Django · DRF · domain rules" href="/guide/django-toolkit" icon={Server} color="teal"/>
 <Card x={695} y={443} title="Data & files" detail="PostgreSQL · private storage" href="/guide/django-models-orm" icon={Database} color="teal"/>
 {wire('M305 487H370')}{wire('M630 487H695')}
 <text className="plate-edge-label" x="337" y="473" textAnchor="middle">HTTPS</text><text className="plate-edge-label" x="662" y="473" textAnchor="middle">scoped I/O</text>
 {wire('M500 531V557H175V585',true)}{wire('M500 531V585',true)}{wire('M500 557H825V585',true)}
 <text className="plate-zone-note" x="946" y="573" textAnchor="end">Add only when needed</text>
 <Card x={45} y={585} title="Real-time" detail="WebSockets · Channels" href="/guide/websocket-design" icon={Radio}/>
 <Card x={370} y={585} title="Background work" detail="Jobs · schedules · retries" href="/guide/reliable-job-lifecycle" icon={ListChecks}/>
 <Card x={695} y={585} title="AI integration" detail="Scoped context · safe tools" href="/guide/deterministic-ai" icon={Sparkles}/>
 <text x="44" y="735" className="plate-zone-label">03 / PROTECT & OPERATE — ACROSS THE BOUNDARIES</text>
 <Link to="/guide/security-boundaries" aria-label="Security across the system"><g className="plate-node violet"><rect x="45" y="753" width="445" height="65" rx="13"/><svg x="63" y="774" width="21" height="21" viewBox="0 0 24 24"><ShieldCheck/></svg><text className="plate-title" x="97" y="779">Security</text><text className="plate-detail" x="97" y="799">Identity · permissions · tenant isolation · browser trust</text></g></Link>
 <Link to="/guide/deployment-platforms" aria-label="Deployment and operations"><g className="plate-node neutral"><rect x="510" y="753" width="445" height="65" rx="13"/><svg x="528" y="774" width="21" height="21" viewBox="0 0 24 24"><Cloud/></svg><text className="plate-title" x="562" y="779">Deployment & operations</text><text className="plate-detail" x="562" y="799">Hosting · monitoring · backups · recovery</text></g></Link>
 <text x="44" y="849" className="plate-subheading">Reference map · Optional capabilities vary by project. This handbook itself is a static frontend.</text>
 </svg>;
}
