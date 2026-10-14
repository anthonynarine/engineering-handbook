// src/shared/LumenAwsPlate.tsx — Show the proposed AWS trust zones without implying a deployed environment.
import { useId } from 'react';
import { Link } from 'react-router';
import { Globe, Network, ShieldCheck, Monitor, Server, Database, Cloud, KeyRound, LockKeyhole, Activity, type LucideIcon } from 'lucide-react';
function Node({x,y,title,detail,icon:Icon,slug,color='blue'}:{x:number;y:number;title:string;detail:string;icon:LucideIcon;slug:string;color?:string}){
 return <Link to={`/guide/${slug}`} aria-label={title}><g className={`plate-node ${color}`}><rect x={x} y={y} width="260" height="84" rx="13"/><rect className="icon-tile" x={x+14} y={y+20} width="36" height="36" rx="9"/><svg x={x+22} y={y+28} width="20" height="20" viewBox="0 0 24 24"><Icon/></svg><text className="plate-title" x={x+62} y={y+35}>{title}</text><text className="plate-detail" x={x+62} y={y+56}>{detail}</text></g></Link>;
}
export default function LumenAwsPlate(){
 const id='lumen-aws-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const wire=(d:string,dashed=false)=><path className={`plate-wire ${dashed?'dashed':''}`} d={d} markerEnd={`url(#${id}-arrow)`}/>;
 return <svg className="architecture-plate build-system-plate lumen-aws-plate" viewBox="0 0 1000 1080" role="img" aria-labelledby={`${id}-title ${id}-desc`}><title id={`${id}-title`}>Lumen planned AWS architecture</title><desc id={`${id}-desc`}>Proposed, not deployed. Browser traffic reaches a WAF-protected HTTPS Application Load Balancer. Separate target groups route to dedicated private EC2 instances for React delivery, Django Reports and FastAPI Media. Gait is a separate identity authority reached over controlled TLS. Recommended private PostgreSQL and private S3 support authorized services. Secrets, administration and audit are cross-cutting controls. Each critical service needs multiple instances across zones for resilience; one instance per service is not high availability. AI is future work.</desc>
 <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8494ae"/></marker></defs><rect width="1000" height="1080" fill="#f5f8fc"/>
 <text x="40" y="35" className="plate-kicker">LUMEN / FLAGSHIP / PROPOSED AWS DESIGN</text><text x="40" y="72" className="plate-heading">Public edge. Private services. Explicit authority.</text><text x="40" y="98" className="plate-subheading">One EC2 service boundary per server · repeat critical tiers across AZs for resilience.</text>
 <rect className="plate-zone" x="25" y="125" width="950" height="180" rx="20"/><text x="44" y="155" className="plate-zone-label">01 / PUBLIC INGRESS & SEPARATE IDENTITY AUTHORITY</text>
 <Node x={45} y={180} title="Browser" detail="React user · HTTPS only" icon={Globe} slug="lumen-platform-design" color="teal"/>
 <Node x={370} y={180} title="WAF + HTTPS ALB" detail="Certificate · rules · target groups" icon={Network} slug="lumen-aws-architecture"/>
 <Node x={695} y={180} title="Gait authority" detail="Separate host · verified identity" icon={ShieldCheck} slug="gait-auth-walkthrough" color="violet"/>
 {wire('M305 222H370')}
 <rect className="plate-zone" x="25" y="338" width="950" height="250" rx="20"/><text x="44" y="368" className="plate-zone-label">02 / PRIVATE APPLICATION SUBNETS — NO PUBLIC INSTANCE IPs</text>
 {wire('M500 264V390H175V422')}{wire('M500 390V422')}{wire('M500 390H825V422')}
 <text x="175" y="410" textAnchor="middle" className="plate-edge-label">UI target group</text><text x="500" y="410" textAnchor="middle" className="plate-edge-label">Reports target group</text><text x="825" y="410" textAnchor="middle" className="plate-edge-label">Media target group</text>
 <Node x={45} y={435} title="UI EC2" detail="Nginx · React build · proxy" icon={Monitor} slug="lumen-aws-architecture"/>
 <Node x={370} y={435} title="Reports EC2" detail="Django · Gait + clinical policy" icon={Server} slug="lumen-platform-design"/>
 <Node x={695} y={435} title="Media EC2" detail="FastAPI · exam authorization" icon={Server} slug="lumen-platform-design"/>
 {wire('M955 477H988V320H825V264',true)}{wire('M630 477H655V320H825',true)}
 <text x="44" y="552" className="plate-subheading">Only approved caller security groups reach service ports. Dashed path: controlled Gait verification egress.</text><text x="44" y="574" className="plate-subheading">Shown once per service for clarity. Singleton instances are an initial footprint, not a high-availability claim.</text>
 <rect className="plate-zone" x="25" y="620" width="950" height="188" rx="20"/><text x="44" y="650" className="plate-zone-label">03 / RECOMMENDED DATA BOUNDARIES & FUTURE CAPABILITIES</text>
 {wire('M500 519V605H175V682')}{wire('M825 519V630H500V682')}
 <Node x={45} y={682} title="Private PostgreSQL" detail="RDS option · TLS · RLS · roles" icon={Database} slug="lumen-aws-security" color="teal"/>
 <Node x={370} y={682} title="Private S3" detail="Scoped roles · encryption · no public ACLs" icon={Cloud} slug="lumen-aws-security" color="teal"/>
 <Node x={695} y={682} title="Future AI tier" detail="Disabled until separately approved" icon={LockKeyhole} slug="lumen-aws-security" color="neutral"/>
 <text x="44" y="793" className="plate-subheading">Media also reads narrowly granted Reports-owned authorization facts; it does not own clinical writes.</text>
 <rect className="plate-zone review-zone" x="25" y="842" width="950" height="150" rx="20"/><text x="44" y="870" className="plate-zone-label">04 / SECURITY & OPERATIONS — REQUIRED ACROSS THE DESIGN</text>
 <Node x={45} y={887} title="IAM · KMS · secrets" detail="Per-service authority · rotation" icon={KeyRound} slug="lumen-aws-security" color="violet"/>
 <Node x={370} y={887} title="Private administration" detail="SSM · MFA · no public SSH" icon={ShieldCheck} slug="lumen-aws-security" color="violet"/>
 <Node x={695} y={887} title="Audit & recovery" detail="Trails · alerts · tested restores" icon={Activity} slug="lumen-aws-release" color="violet"/>
 <text x="44" y="1025" className="plate-subheading">Clinical permissions remain inside Lumen. ALB routing and private networking do not grant access.</text><text x="44" y="1050" className="plate-subheading">All AWS resources and controls shown are planned. No cloud provisioning or runtime security tests were performed.</text>
 </svg>;
}
