const WP_API_URL = 'https://blog.tokenradar.site/wp-json/wp/v2';

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  categories: number[];
  _embedded?: {
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  categories?: number;
  search?: string;
}): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set('_embed', 'wp:term');
  searchParams.set('per_page', String(params?.perPage || 12));
  searchParams.set('page', String(params?.page || 1));
  if (params?.categories) searchParams.set('categories', String(params.categories));
  if (params?.search) searchParams.set('search', params.search);

  const res = await fetch(`${WP_API_URL}/posts?${searchParams}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return { posts: [], total: 0, totalPages: 0 };

  const posts: WPPost[] = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '0');

  return { posts, total, totalPages };
}

export async function getPost(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed=wp:term`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  const posts: WPPost[] = await res.json();
  return posts[0] || null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API_URL}/categories?per_page=100`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];
  return res.json();
}
