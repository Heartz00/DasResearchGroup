export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  html: string;
  link: string;
  modified: string;
  featuredMedia: number;
  parent?: number;
  author?: number;
  excerpt?: string;
}
export interface Media {
  id: number;
  url: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
  sizes?: Record<
    string,
    { source_url: string; width: number; height: number } | undefined
  >;
}
export interface Photo {
  url: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}
export interface Person {
  id: string;
  name: string;
  role: string;
  alumni: boolean;
  photo?: Photo;
  html: string;
  interests?: string;
  email?: string;
  featured?: boolean;
  order?: number;
  links?: { label: string; href: string }[];
}
export interface Publication {
  id: string;
  title: string;
  year?: number;
  html: string;
  link?: string;
  doi?: string;
  photo?: Photo;
  prior: boolean;
  status: string;
  featured: boolean;
  order?: number;
  type?: string;
}
export interface News {
  id: string;
  title: string;
  html: string;
  date?: string;
  link?: string;
  photo?: Photo;
  featured?: boolean;
  summary?: string;
  categories?: string[];
  credit?: string;
}
export interface CmsPost extends CmsPage {
  date: string;
  categories: number[];
  tags: number[];
}
export interface Taxonomy {
  id: number;
  slug: string;
  name: string;
}
export interface SiteContent {
  pages: CmsPage[];
  media: Media[];
  posts: CmsPost[];
  categories: Taxonomy[];
  tags: Taxonomy[];
  mode: 'live' | 'offline' | 'unavailable';
  capturedAt?: string;
}
