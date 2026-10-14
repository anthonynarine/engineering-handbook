// src/features/reading-library/ReadingLibrary.tsx — Keep bookmarks and recent guide IDs in local browser storage.
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { articles } from '../handbook';
import './reading-library.css';
type Stored={saved:string[];recent:string[]};
const storageKey='handbook-reading-library-v1';
const known=new Set(articles.filter(article=>article.slug!=='my-library').map(article=>article.slug));
function normalize(value:unknown):Stored {
 const record=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const ids=(raw:unknown,limit:number)=>Array.isArray(raw)?[...new Set(raw.filter((id):id is string=>typeof id==='string'&&known.has(id)))].slice(0,limit):[];
 return {saved:ids(record.saved,200),recent:ids(record.recent,20)};
}
function read():Stored {try{return normalize(JSON.parse(localStorage.getItem(storageKey)??'{}'));}catch{return {saved:[],recent:[]};}}
export function useReadingLibrary(slug?:string){
 const [data,setData]=useState(read);const [notice,setNotice]=useState('Stored only in this browser.');
 useEffect(()=>{if(slug&&known.has(slug))setData(previous=>previous.recent[0]===slug?previous:{...previous,recent:[slug,...previous.recent.filter(id=>id!==slug)].slice(0,20)});},[slug]);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(data));setNotice('Stored only in this browser.');}catch{setNotice('Browser storage is unavailable. Lists last only for this open session.');}},[data]);
 function toggle(id:string){if(!known.has(id))return;setData(previous=>({...previous,saved:previous.saved.includes(id)?previous.saved.filter(value=>value!==id):[id,...previous.saved]}));}
 return {...data,notice,toggle,clearSaved:()=>setData(previous=>({...previous,saved:[]})),clearRecent:()=>setData(previous=>({...previous,recent:[]}))};
}
type Library=ReturnType<typeof useReadingLibrary>;
export function ArticleBookmark({slug,library}:{slug:string;library:Library}){
 const saved=library.saved.includes(slug);const Icon=saved?BookmarkCheck:Bookmark;
 return <div className="article-bookmark"><button type="button" aria-pressed={saved} onClick={()=>library.toggle(slug)}><Icon size={16}/>{saved?'Remove bookmark':'Save guide'}</button><Link to="/guide/my-library">Saved & recently viewed →</Link></div>;
}
export default function ReadingLibrary({library}:{library:Library}){
 return <section className="reading-library" aria-label="Reading library"><p className="library-notice" role="status">{library.notice}</p>{([{name:'Saved guides',ids:library.saved,clear:library.clearSaved,empty:'No saved guides yet. Open any guide and choose Save guide.',action:'Clear bookmarks'},{name:'Recently viewed',ids:library.recent,clear:library.clearRecent,empty:'No recent guides. Open a guide to start your reading history.',action:'Clear reading history'}]).map(list=><section className="library-list" key={list.name} aria-label={list.name}><div className="library-heading"><h2>{list.name}</h2><button type="button" disabled={list.ids.length===0} onClick={list.clear}>{list.action}</button></div>{list.ids.length?<ul>{list.ids.map(slug=>{const article=articles.find(item=>item.slug===slug)!;return <li key={slug}><Link to={`/guide/${slug}`}><strong>{article.title}</strong><small>{article.summary}</small></Link>{list.name==='Saved guides'&&<button type="button" onClick={()=>library.toggle(slug)} aria-label={`Remove bookmark: ${article.title}`}>Remove</button>}</li>;})}</ul>:<p className="library-empty">{list.empty}</p>}</section>)}</section>;
}
