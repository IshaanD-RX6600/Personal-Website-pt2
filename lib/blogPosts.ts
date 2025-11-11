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
  // Hero image file placed in /public. Attachment in repo is a PNG, ensure path matches.
  image: '/nbe-blogathon-beads.png',
  videoUrl: 'https://www.youtube.com/watch?v=OM4fXB23pCQ'
  },
  {
    slug: 'uncovering-my-equilibrium',
    title: 'Uncovering my Equilibrium',
    excerpt: 'A journey of finding balance in life, work, and personal growth through self-reflection.',
    date: '2025-10-26',
    tags: ['personal', 'reflection', 'balance'],
    image: '/equilibrium.jpg'
  },
  {
    slug: 'whispers-of-the-kushtaka',
    title: 'Whispers of the Kushtaka',
    excerpt: 'Exploring the Tlingit legend of the shape-shifting Land-Otter Man and the cultural lessons about respect, caution, and the seen/unseen world.',
    date: '2025-11-11',
    tags: ['folklore', 'tlingit', 'myth', 'culture'],
    videoUrl: 'https://www.youtube.com/watch?v=Uc6prRBCpS4',
    image: '/kushtaka-drawing.webp'
  }
];
