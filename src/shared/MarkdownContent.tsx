// src/shared/MarkdownContent.tsx — Render repository Markdown without raw HTML or executable link schemes.
import { useRef, useState, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Diagram from './Diagram';
export function safeContentUrl(value:string):string {
 if(!value||/[\u0000-\u0020\u007f]/.test(value)||value.startsWith('//')||value.includes('\\'))return '';
 if(value.startsWith('#')||value.startsWith('/'))return value;
 try {const url=new URL(value);return ['https:','http:','mailto:'].includes(url.protocol)?value:'';}catch{return '';}
}
function CodeBlock({children}:{children?:ReactNode}){
 const ref=useRef<HTMLPreElement>(null);const [state,setState]=useState('Copy');
 async function copy(){try{await navigator.clipboard.writeText(ref.current?.textContent??'');setState('Copied');}catch{setState('Copy failed');}}
 return <div className="codeblock"><button onClick={copy} aria-live="polite">{state}</button><pre ref={ref}>{children}</pre></div>;
}
export default function MarkdownContent({body}:{body:string}){
 return <Markdown skipHtml remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} urlTransform={safeContentUrl} components={{
  a:({href,children})=><a href={href||undefined} rel="noopener noreferrer">{children}</a>,
  img:({src,alt})=>typeof src==='string'&&src.startsWith('/')&&!src.startsWith('//')?<img src={src} alt={alt??''} loading="lazy"/>:<span>{alt}</span>,
  pre:({children})=>{const child=children as {props?:{className?:string;children?:string}};return child?.props?.className==='language-mermaid'?<Diagram source={String(child.props.children??'')}/>:<CodeBlock>{children}</CodeBlock>;},
 }}>{body}</Markdown>;
}
