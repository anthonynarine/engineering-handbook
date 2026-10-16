// A client-only graph workspace with linked global/local views and readable names.
import {useEffect,useMemo,useRef,useState} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router';
import {Minus,Plus,RotateCcw,ArrowUpRight,SlidersHorizontal,Maximize2,Minimize2} from 'lucide-react';
import {navigationSections} from './navigation';
import {graphSections,sectionCenter} from './graph-sections';
import {graphLabels} from './graph-labels';
import {graphNodes as nodes,nodeById,graphLinks as relations,neighbors,defaultForces,initialPositions,type GraphForces,neighborhood} from './graph-model';
import './knowledge-graph.css';
const starts:Record<string,string>={start:'build-manual',foundry:'foundry-repository',server:'django-toolkit',client:'frontend-architecture',security:'security-boundaries',ai:'deterministic-ai',operations:'ci-cd-release-workflow',projects:'lumen-platform-design'};
type Point={x:number;y:number};
type View={zoom:number;x:number;y:number};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export default function KnowledgeGraph(){
 const [mobile,setMobile]=useState(()=>matchMedia('(max-width: 800px)').matches);
 useEffect(()=>{const media=matchMedia('(max-width: 800px)');const change=()=>setMobile(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const navigate=useNavigate();const [params,setParams]=useSearchParams();
 const mode=params.get('graph')==='local'?'local':'global';const query=params.get('gq')??'';
 const topic=navigationSections.some(item=>item.id===params.get('topic'))?params.get('topic')!:'all';
 const focus=nodeById.has(params.get('focus')??'')?params.get('focus')!:'foundry-repository';
 const depth=clamp(Math.round(Number(params.get('depth'))||1),1,3);
 const [section,setSection]=useState('foundry');const [selected,setSelected]=useState<string|null>(null);const [hovered,setHovered]=useState<string|null>(null);
 const [positions,setPositions]=useState(initialPositions);const [view,setView]=useState<View>({zoom:.8,x:0,y:0});
 const [forces,setForces]=useState<GraphForces>({...defaultForces});const [expanded,setExpanded]=useState(false);
 const expandButton=useRef<HTMLButtonElement>(null);const wasExpanded=useRef(false);const svg=useRef<SVGSVGElement>(null);const dialog=useRef<HTMLDialogElement>(null);const pinned=useRef<string|null>(null);const paused=useRef(false);const onScreen=useRef(true);
 const pointer=useRef<{x:number;y:number;held:string|null;guard:string|null}|null>(null);
 const pan=useRef<{x:number;y:number;view:View;moved:boolean;guide:string|null}|null>(null);
 const nodeDrag=useRef<{index:number;pointer:Point;origin:Point;moved:boolean}|null>(null);
 const terms=useMemo(()=>query.toLowerCase().trim().split(/\s+/).filter(Boolean),[query]);
 const local=useMemo(()=>neighborhood(focus,depth),[focus,depth]);
 const visible=useMemo(()=>nodes.filter(node=>(mode==='global'||local.has(node.id))&&(topic==='all'||node.section===topic)&&terms.every(term=>`${node.article.title} ${node.article.summary} ${node.article.tags.join(' ')} ${node.article.body}`.toLowerCase().includes(term))),[mode,local,topic,terms]);
 const visibleIds=useMemo(()=>new Set(visible.map(node=>node.id)),[visible]);
 const visibleLinks=useMemo(()=>relations.filter(link=>visibleIds.has(link.from)&&visibleIds.has(link.to)),[visibleIds]);
 const targets=useMemo(()=>nodes.map(node=>{
  if(mode==='global')return sectionCenter(node.section);if(node.id===focus)return {x:500,y:370};
  const members=nodes.filter(item=>local.has(item.id)&&item.id!==focus);const index=members.indexOf(node);if(index<0)return {x:node.x,y:node.y};const angle=index*2.39996;const radius=100+Math.sqrt((index+.5)/Math.max(1,members.length))*200;
  return {x:500+Math.cos(angle)*radius,y:370+Math.sin(angle)*radius};
 }),[mode,focus,local]);
 const runtime=useRef({forces,visibleIds,targets,mode});runtime.current={forces,visibleIds,targets,mode};
 const active=selected&&visibleIds.has(selected)?nodeById.get(selected):null;const preview=hovered&&visibleIds.has(hovered)?nodeById.get(hovered):null;const inspected=preview??active??(mode==='local'&&visibleIds.has(focus)?nodeById.get(focus):null);
 const related=new Set(inspected?[inspected.id,...neighbors[inspected.index].map(index=>nodes[index].id)]:visible.filter(node=>node.section===(topic==='all'?section:topic)).map(node=>node.id));
 function update(changes:Record<string,string>){setParams(previous=>{const next=new URLSearchParams(previous);for(const [key,value] of Object.entries(changes)){if(value)next.set(key,value);else next.delete(key);}return next;},{replace:true});}
 function clearHover(){pointer.current=null;setHovered(null);}
 function clearFilters(){update({gq:'',topic:'',graph:'',focus:'',depth:''});clearHover();}
 function chooseSection(id:string){setSection(id);setSelected(null);pinned.current=null;clearHover();if(topic!=='all')update({topic:id});}
 function chooseNote(id:string){const node=nodeById.get(id)!;pinned.current=id;setSelected(id);setSection(node.section);if(mode==='local'&&focus!==id)update({focus:id});}
 function showLocal(){const id=inspected?.id??selected??focus;setSelected(id);setSection(nodeById.get(id)!.section);update({graph:'local',focus:id});clearHover();}
 function zoom(delta:number){setView(previous=>({...previous,zoom:clamp(previous.zoom+delta,.35,4)}));}
 function resetLayout(){pinned.current=null;clearHover();setPositions(mode==='global'?initialPositions():targets.map(point=>({...point})));setView({zoom:.8,x:0,y:0});}
 useEffect(()=>{clearHover();},[query,topic,mode]);
 useEffect(()=>{if(mode==='local'){pinned.current=null;setPositions(targets.map(point=>({...point})));setView({zoom:.8,x:0,y:0});}},[mode,focus,depth]);
 useEffect(()=>{
  const element=dialog.current;if(expanded&&element&&!element.open)element.showModal();if(!expanded&&wasExpanded.current)expandButton.current?.focus({preventScroll:true});wasExpanded.current=expanded;
 },[expanded]);
 useEffect(()=>{
  const element=svg.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>{onScreen.current=entry.isIntersecting;});observer.observe(element);
  function wheel(event:WheelEvent){event.preventDefault();const matrix=element!.getScreenCTM();if(!matrix)return;const cursor=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());clearHover();setView(previous=>{const z=clamp(previous.zoom*Math.exp(-event.deltaY*.0015),.35,4);return {zoom:z,x:cursor.x-500-(cursor.x-500-previous.x)*z/previous.zoom,y:cursor.y-370-(cursor.y-370-previous.y)*z/previous.zoom};});}
  element.addEventListener('wheel',wheel,{passive:false});return()=>{observer.disconnect();element.removeEventListener('wheel',wheel);};
 },[expanded]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');const mobile=matchMedia('(max-width: 800px)');let frame=0;let live=true;let last=0;const velocity=nodes.map(()=>({x:0,y:0}));
  function animate(now:number){if(!live)return;if(paused.current||!onScreen.current||document.hidden||now-last<33){frame=requestAnimationFrame(animate);return;}last=now;
   setPositions(previous=>nodes.map((node,index)=>{
    const {forces:f,visibleIds:ids,targets:t}=runtime.current;const v=velocity[index];const cursor=pointer.current;
    if(!ids.has(node.id)||cursor?.held===node.id||cursor?.guard===node.id||pinned.current===node.id){v.x=0;v.y=0;return previous[index];}
    const x=t[index].x;const y=t[index].y;let fx=0;let fy=0;
    const cx=previous[index].x-500;const cy=previous[index].y-370;const radialDistance=Math.hypot(cx,cy);if(radialDistance>270){const pull=(radialDistance-270)*.25;fx-=cx/radialDistance*pull;fy-=cy/radialDistance*pull;}
    previous.forEach((other,j)=>{if(j===index||!ids.has(nodes[j].id))return;const dx=previous[index].x-other.x;const dy=previous[index].y-other.y;const d=Math.hypot(dx,dy);if(d>0){const push=Math.min(10,500*f.repel/d);fx+=dx/d*push;fy+=dy/d*push;}});
    neighbors[index].forEach(j=>{if(!ids.has(nodes[j].id))return;const dx=previous[j].x-previous[index].x;const dy=previous[j].y-previous[index].y;const distance=Math.max(1,Math.hypot(dx,dy));const force=(distance-f.distance)*f.link;fx+=dx/distance*force;fy+=dy/distance*force;});
    const cluster=runtime.current.mode==='global'?(graphSections[node.section]?.core===node.id? .065:.018):0;
    v.x=clamp((v.x+(x-previous[index].x)*(f.center+cluster)+fx)*.86,-12,12);v.y=clamp((v.y+(y-previous[index].y)*(f.center+cluster)+fy)*.86,-12,12);
    return {x:previous[index].x+v.x,y:previous[index].y+v.y};
   }));frame=requestAnimationFrame(animate);
  }
  function preference(){cancelAnimationFrame(frame);velocity.forEach(v=>{v.x=0;v.y=0;});if(media.matches||mobile.matches)setPositions(initialPositions());else frame=requestAnimationFrame(animate);}
  preference();media.addEventListener('change',preference);mobile.addEventListener('change',preference);return()=>{live=false;cancelAnimationFrame(frame);media.removeEventListener('change',preference);mobile.removeEventListener('change',preference);};
 },[]);
 function world(clientX:number,clientY:number){const matrix=svg.current?.querySelector('g')?.getScreenCTM();return matrix?new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse()):null;}
 function pointerDown(event:React.PointerEvent<SVGSVGElement>){
  const guide=(event.target as Element).closest('[data-guide]');
  if(guide){event.preventDefault();const id=guide.hasAttribute('data-label-guide')?guide.getAttribute('data-guide')!:pointer.current?.held??guide.getAttribute('data-guide')!;const node=nodeById.get(id)!;const point=world(event.clientX,event.clientY);if(!point)return;nodeDrag.current={index:node.index,pointer:point,origin:positions[node.index],moved:false};chooseNote(id);paused.current=false;event.currentTarget.setPointerCapture(event.pointerId);return;}
  if((event.target as Element).closest('[role="button"]'))return;pan.current={x:event.clientX,y:event.clientY,view,moved:false,guide:pointer.current?.held??null};event.currentTarget.setPointerCapture(event.pointerId);
 }
 function pointerMove(event:React.PointerEvent<SVGSVGElement>){
  paused.current=false;const point=world(event.clientX,event.clientY);if(!point)return;
  if(nodeDrag.current){const drag=nodeDrag.current;if(Math.hypot(point.x-drag.pointer.x,point.y-drag.pointer.y)>5/view.zoom)drag.moved=true;setPositions(previous=>previous.map((p,index)=>index===drag.index?{x:drag.origin.x+point.x-drag.pointer.x,y:drag.origin.y+point.y-drag.pointer.y}:p));return;}
  const matrix=event.currentTarget.querySelector('g')!.getScreenCTM()!;const scale=Math.hypot(matrix.a,matrix.b);
  const distance=(node:typeof nodes[number])=>Math.hypot(positions[node.index].x-point.x,positions[node.index].y-point.y)*scale;
  let target=pointer.current?.held&&visibleIds.has(pointer.current.held)?nodeById.get(pointer.current.held)!:null;
  if(target&&distance(target)>=76)target=null;
  if(target&&distance(target)>14){let closest=8;for(const node of visible){const d=distance(node);if(d<closest){closest=d;target=node;}}}
  if(!target){let closest=44;for(const node of visible){const d=distance(node);if(d<closest){closest=d;target=node;}}}
  const label=(event.target as Element).closest('[data-label-guide]')?.getAttribute('data-guide');if(label)target=nodeById.get(label)!;
  if((event.target as Element).closest('.graph-hub')||pan.current)target=null;
  let guard:string|null=null;if(!target&&!pan.current){let closest=120;for(const node of visible){const d=distance(node);if(d<closest){closest=d;guard=node.id;}}}
  pointer.current={x:point.x,y:point.y,held:target?.id??null,guard};setHovered(target?.id??null);
  if(pan.current){const start=pan.current;const scale=event.currentTarget.viewBox.baseVal.width/event.currentTarget.getBoundingClientRect().width;const dx=(event.clientX-start.x)*scale;const dy=(event.clientY-start.y)*scale;if(Math.abs(dx)+Math.abs(dy)>4){start.moved=true;setView({...start.view,x:start.view.x+dx,y:start.view.y+dy});}}
 }
 function pointerUp(){const drag=nodeDrag.current;nodeDrag.current=null;if(drag&&!drag.moved)navigate(`/guide/${nodes[drag.index].id}`);else if(pan.current&&!pan.current.moved&&pan.current.guide)navigate(`/guide/${pan.current.guide}`);pan.current=null;}


 const cores=visible.filter(node=>graphSections[node.section]?.core===node.id);
 const labels=graphLabels(visible.filter(node=>!cores.includes(node)).map(node=>({...node,...positions[node.index],title:node.article.title,priority:hovered===node.id?100:selected===node.id?95:mode==='local'&&focus===node.id?94:Math.min(80,neighbors[node.index].length)})),cores.map(node=>[positions[node.index].x,positions[node.index].y] as [number,number]),view.zoom);
 const point=(id:string)=>positions[nodeById.get(id)!.index];
 const radius=(node:typeof nodes[number])=>(4+Math.min(9,Math.sqrt(neighbors[node.index].length)*1.2)+(selected===node.id||hovered===node.id||(mode==='local'&&focus===node.id)?3:0))*forces.nodeSize;
 const mobileItems=visible.filter(node=>mode==='local'||query.trim()||topic!=='all'||node.section===section);
 const displaySection=topic==='all'?section:topic;
 const sectionTitle=query.trim()&&topic==='all'?'Matching guides':navigationSections.find(item=>item.id===displaySection)!.name;
 const directoryLink=query.trim()?`/guides?q=${encodeURIComponent(query)}${topic!=='all'?'&topic='+topic:''}`:`/guides?topic=${displaySection}`;
 const body=<>
 <h1 className="graph-floating-title">Engineering brain</h1>
 <details className="graph-options"><summary aria-label="Graph controls"><SlidersHorizontal size={16} aria-hidden="true"/><span className="graph-screen-reader">Graph controls</span></summary><div className="graph-options-body"><div className="graph-discovery"><div role="group" aria-label="Graph view"><button type="button" aria-pressed={mode==='global'} onClick={()=>update({graph:'',focus:'',depth:''})}>Global graph</button><button type="button" aria-pressed={mode==='local'} onClick={showLocal}>Local graph</button></div><label>Search graph<input type="search" value={query} onChange={event=>update({gq:event.target.value})} placeholder="Find a guide, topic, or command…"/></label><label>Graph topic<select value={topic} onChange={event=>update({topic:event.target.value==='all'?'':event.target.value})}><option value="all">All topics</option>{navigationSections.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button type="button" onClick={clearFilters}>Clear graph filters</button></div>
 {mode==='local'&&<div className="graph-local-controls"><label>Focus guide<select value={focus} onChange={event=>chooseNote(event.target.value)}>{nodes.map(node=><option key={node.id} value={node.id}>{node.article.title}</option>)}</select></label><label>Connection depth<select value={depth} onChange={event=>update({depth:event.target.value})}>{[1,2,3].map(value=><option key={value} value={value}>{value} {value===1?'step':'steps'}</option>)}</select></label><p>Showing the focus guide and its connections within {depth} {depth===1?'step':'steps'}.</p></div>}
 <details className="graph-settings"><summary>Graph settings</summary><div>{([
  ['center','Center force',0,.04,.001],['repel','Repel force',0,.14,.005],['link','Link force',0,.008,.0005],['distance','Link distance',40,300,10],['nodeSize','Node size',.6,1.8,.1],['linkWidth','Link thickness',.3,2,.1],
 ] as const).map(([key,name,min,max,step])=><label key={key}>{name}<input type="range" aria-label={name} min={min} max={max} step={step} value={forces[key]} onChange={event=>setForces(previous=>({...previous,[key]:Number(event.target.value)}))}/><output>{forces[key]}</output></label>)}<button type="button" onClick={()=>{setForces({...defaultForces});resetLayout();}}>Restore graph defaults</button><button type="button" onClick={resetLayout}>Reset layout</button></div></details>
 </div></details>
 <p className="graph-result-count graph-screen-reader" role="status">{visible.length} of {nodes.length} guides · {visibleLinks.length} guide connections{mode==='local'?` · Local graph: ${nodeById.get(focus)!.article.title}`:''}</p>
 <div className="knowledge-workspace" onPointerLeave={clearHover}><div className="knowledge-canvas"><div className="graph-toolbar" role="group" aria-label="Knowledge graph controls"><button type="button" onClick={()=>zoom(-.2)} aria-label="Zoom out knowledge graph"><Minus size={15}/></button><output aria-label="Knowledge graph zoom">{Math.round(view.zoom*100)}%</output><button type="button" onClick={()=>zoom(.2)} aria-label="Zoom in knowledge graph"><Plus size={15}/></button><button type="button" aria-label="Reset knowledge graph view" onClick={()=>setView({zoom:.8,x:0,y:0})}><RotateCcw size={14}/></button><button ref={expandButton} className="graph-expand" type="button" aria-label={expanded?'Close expanded graph':'Expand knowledge graph'} onClick={()=>setExpanded(value=>!value)}>{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button></div>
 <svg ref={svg} className="knowledge-svg" viewBox={mobile?'200 0 600 740':'0 0 1000 740'} role="group" aria-label="Interactive guide graph" onPointerEnter={()=>{paused.current=false;}} onPointerLeave={event=>{if(!(event.relatedTarget instanceof Element&&event.relatedTarget.closest('.graph-inspector')))clearHover();if(!svg.current?.contains(document.activeElement))paused.current=false;}} onFocusCapture={()=>{paused.current=true;}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))paused.current=false;}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{nodeDrag.current=null;pan.current=null;}} onKeyDown={event=>{if(event.ctrlKey||event.metaKey)return;if(event.key==='+'||event.key==='='){event.preventDefault();zoom(.2);}if(event.key==='-'){event.preventDefault();zoom(-.2);}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const step=event.shiftKey?100:35;setView(previous=>({...previous,x:previous.x+(event.key==='ArrowLeft'?step:event.key==='ArrowRight'?-step:0),y:previous.y+(event.key==='ArrowUp'?step:event.key==='ArrowDown'?-step:0)}));}}}>
 <g transform={`translate(${view.x} ${view.y}) translate(500 370) scale(${view.zoom}) translate(-500 -370)`}>
 <g className="graph-edges" aria-hidden="true">{visible.filter(node=>node.id!==graphSections[node.section].core&&visibleIds.has(graphSections[node.section].core)).map(node=><line className="graph-branch" key={'branch-'+node.id} x1={point(graphSections[node.section].core).x} y1={point(graphSections[node.section].core).y} x2={point(node.id).x} y2={point(node.id).y} style={{stroke:graphSections[node.section].color,strokeWidth:forces.linkWidth}}/>)}{visibleLinks.map(edge=><line key={edge.from+'|'+edge.to} x1={point(edge.from).x} y1={point(edge.from).y} x2={point(edge.to).x} y2={point(edge.to).y} style={{strokeWidth:forces.linkWidth*(inspected&&(edge.from===inspected.id||edge.to===inspected.id)?1.5:1)}} className={inspected&&(edge.from===inspected.id||edge.to===inspected.id)?'is-related':'graph-crosslink'}/>)}</g>
 {visible.map(node=>{const config=graphSections[node.section];const Icon=config.icon;const core=config.core===node.id;const size=core?20:14;return <g key={node.id} data-guide={node.id} data-core={core||undefined} data-section={node.section} data-connections={neighbors[node.index].length} role="button" tabIndex={0} aria-label={`Explore guide: ${node.article.title}`} aria-pressed={selected===node.id} style={{'--node-color':config.color} as React.CSSProperties} className={`graph-note ${core?'is-core':''} ${inspected&&!related.has(node.id)?'is-dimmed':''} ${related.has(node.id)?'is-connected':''} ${selected===node.id?'is-selected':''} ${hovered===node.id?'is-locked':''}`} transform={`translate(${positions[node.index].x} ${positions[node.index].y})`} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();navigate(`/guide/${node.id}`);}if(event.key===' '){event.preventDefault();chooseNote(node.id);}}}><title>{node.article.title} · {navigationSections.find(item=>item.id===node.section)!.name} · {neighbors[node.index].length} connections</title><circle className="graph-hit" r="26"/><circle className="graph-dot" r={Math.max(core?15:10,radius(node))}/><Icon className="graph-node-icon" x={-size/2} y={-size/2} width={size} height={size} aria-hidden="true" pointerEvents="none"/>{core&&<text className="graph-core-label" textAnchor="middle" y="29">{navigationSections.find(item=>item.id===node.section)!.name}</text>}</g>;})}
 <g className="graph-node-labels" aria-hidden="true">{labels.map(label=><text key={label.id} data-label-guide={label.id} data-guide={label.id} className={hovered===label.id||selected===label.id?'is-emphasized':''} x={label.x} y={label.y+label.size} style={{fontSize:label.size,'--node-color':graphSections[nodeById.get(label.id)!.section].color,opacity:hovered===label.id||selected===label.id||focus===label.id&&mode==='local'?1:clamp((view.zoom-.55)*.8,0,1)} as React.CSSProperties}>{label.lines.map((line,index)=><tspan key={index} x={label.x} dy={index?label.size+3:0}>{line}</tspan>)}</text>)}</g>
 </g></svg>{!visible.length&&<div className="graph-empty"><h3>No guides match</h3><p>Try fewer words or another topic.</p><button type="button" onClick={clearFilters}>Show all guides</button></div>}<div className="graph-caption"><span>Click to open · Space to select</span><small>Wheel to zoom · Drag a node or the canvas · + / − and arrow keys</small></div></div>
 <aside className={`graph-inspector graph-selection ${inspected?'has-guide':''}`} aria-label="Selected knowledge"><span className="eyebrow">{inspected?'SELECTED GUIDE':query.trim()||topic!=='all'?'FILTERED GUIDES':'SELECTED SECTION'}</span><h3>{inspected?inspected.article.title:sectionTitle}</h3><p>{inspected?inspected.article.summary:'Choose a guide to follow its connections.'}</p>{(inspected||(!query.trim()&&topic==='all'))&&<Link className="graph-open" to={`/guide/${inspected?inspected.id:starts[section]}`}>{inspected?'Open this guide':'Start here'} <ArrowUpRight size={15}/></Link>}{preview&&<button className="graph-pin-guide" type="button" onClick={()=>chooseNote(preview.id)}>Select guide</button>}{inspected&&mode==='global'&&<button className="graph-local-link" type="button" onClick={showLocal}>View local graph</button>}<h4>{mode==='local'?'In this graph':query.trim()||topic!=='all'?'Matching guides':inspected?'Related guides':'In this section'}</h4><div className="graph-inspector-links">{(mode==='local'||query.trim()||topic!=='all'?mobileItems:inspected?neighbors[inspected.index].map(index=>nodes[index]):mobileItems).map(node=><Link key={node.id} to={`/guide/${node.id}`}>{node.article.title}<ArrowUpRight size={12}/></Link>)}</div><Link className="graph-topic-link" to={directoryLink}>Browse {query.trim()?'matching guides':sectionTitle} →</Link></aside></div>
 <nav className="graph-topics" aria-label="Knowledge graph sections">{navigationSections.map(item=><button type="button" key={item.id} aria-pressed={(topic==='all'?section:topic)===item.id} onClick={()=>chooseSection(item.id)}>{item.name}<span>{nodes.filter(node=>node.section===item.id).length}</span></button>)}</nav><p className="graph-footnote">Connections follow guide links and related-guide references. Larger nodes have more connections. Local view follows the focus guide within the selected depth.</p>
 </>;
 return <section className="knowledge-map" aria-label="Connected handbook">{expanded?<dialog ref={dialog} className="graph-expanded-dialog" aria-label="Expanded knowledge graph" onCancel={()=>setExpanded(false)}>{body}</dialog>:body}</section>;
}
