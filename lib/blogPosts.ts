export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  tags?: string[];
  image?: string; // optional hero/thumbnail path
  videoUrl?: string; // optional YouTube/watch link
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: 'nbe-blogathon',
  title: 'The Story of Colors',
  excerpt: 'A strand of beads and a sequence of shades telling a small event story.',
  date: '2025-10-05',
  tags: ['event','blogathon'],
  // Hero image file placed in /public. Provided attachment looked like a tall PNG photo of beads.
  image: '/nbe-blogathon-beads.jpg',
  videoUrl: 'https://www.youtube.com/watch?v=OM4fXB23pCQ'
  }
];
