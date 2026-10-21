// src/features/handbook/index.ts — Public content types and generated article registry.
import data from '../../generated/articles.json';
export interface Article { title:string; slug:string; section:string; summary:string; order:number; tags:string[]; status:string; lastReviewed:string; sources:string[]; related:string[]; body:string; file:string; lesson?:Lesson }
export interface Lesson { level:string; duration:string; prerequisites:string[]; objectives:string[] }
export const articles: Article[] = data;
