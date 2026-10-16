// Public handbook links form a local graph; no remote graph service is needed.
import {articles} from './index';
import {navigationSection} from './navigation';
export const anchors:Record<string,[number,number]>={start:[135,125],foundry:[430,120],client:[780,155],server:[580,340],security:[220,365],ai:[285,590],operations:[800,570],projects:[560,595]};
export const graphNodes=articles.map((article,index)=>{
 const section=navigationSection(article);const group=articles.filter(item=>navigationSection(item)===section);const ordinal=group.indexOf(article);const angle=ordinal*2.39996;const radius=42+Math.sqrt((ordinal+.5)/group.length)*65;const [x,y]=anchors[section];
 return {id:article.slug,index,article,section,x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius};
});
export const nodeById=new Map(graphNodes.map(node=>[node.id,node]));
export const graphLinks=[...new Map(graphNodes.flatMap(node=>{
 const destinations=[...node.article.related,...[...node.article.body.matchAll(/\]\(\/guide\/([a-z0-9-]+)(?:#[^)]*)?\)/g)].map(match=>match[1])];
 return destinations.filter(id=>id!==node.id&&nodeById.has(id)).map(id=>[[node.id,id].sort().join('|'),{from:node.id,to:id}] as const);
})).values()];
export const neighbors=graphNodes.map(node=>graphLinks.filter(link=>link.from===node.id||link.to===node.id).map(link=>nodeById.get(link.from===node.id?link.to:link.from)!.index));
export function neighborhood(id:string,depth:number){const visited=new Set<string>(nodeById.has(id)?[id]:[]);let frontier=[...visited];for(let i=0;i<depth;i++){const next:string[]=[];for(const current of frontier)for(const index of neighbors[nodeById.get(current)!.index]){const id=graphNodes[index].id;if(!visited.has(id)){visited.add(id);next.push(id);}}frontier=next;}return visited;}
export const defaultForces={center:.015,repel:.055,link:.002,distance:180,nodeSize:1,linkWidth:.8};
export type GraphForces=typeof defaultForces;
export const initialPositions=()=>graphNodes.map((node,index)=>({x:node.x+Math.cos(index*2.4)*16,y:node.y+Math.sin(index*2.4)*16}));
