// Place readable node names without covering section names or one another.
export type GraphLabel={id:string;x:number;y:number;width:number;height:number;size:number;lines:string[]};
export function graphLabels(candidates:{id:string;title:string;x:number;y:number;priority:number}[],hubs:[number,number][],zoom:number):GraphLabel[]{
 const boxes=hubs.map(([x,y])=>({x:x-90,y:y-70,width:180,height:95}));const result:GraphLabel[]=[];
 for(const node of candidates.sort((a,b)=>b.priority-a.priority)){
  const size=node.priority>=90?25:18;const lines=node.title.split(' ').reduce<string[]>((lines,word)=>{const i=lines.length-1;if(i>=0&&lines[i].length+word.length<31)lines[i]+=' '+word;else lines.push(word);return lines;},[]);
  const width=Math.max(...lines.map(line=>line.length))*size*.53+10;const height=lines.length*(size+3)+8;
  const options=[{x:node.x+17,y:node.y-height+9},{x:node.x-width-17,y:node.y-height+9},{x:node.x-width/2,y:node.y+19},{x:node.x-width/2,y:node.y-height-20}];
  const fits=(box:{x:number;y:number})=>box.x>=12&&box.x+width<=988&&box.y>=12&&box.y+height<=720&&!boxes.some(other=>box.x<other.x+other.width+9&&box.x+width+9>other.x&&box.y<other.y+other.height+8&&box.y+height+8>other.y);
  const placement=options.find(fits)??(node.priority>=90?{x:Math.max(12,Math.min(988-width,node.x+17)),y:Math.max(12,Math.min(720-height,node.y-height-20))}:null);
  if(!placement)continue;const label={id:node.id,...placement,width,height,size,lines};result.push(label);boxes.push(label);
  if(result.length>=(zoom>=1.7?16:8))break;
 }
 return result;
}
