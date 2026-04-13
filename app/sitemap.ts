import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/wordpress';
import { createServerSupabase } from '@/lib/supabase/server';

const SITE = 'https://tokenradar.site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE}/tokens`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${SITE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Fetch blog posts from WordPress
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getPosts({ perPage: 100 });
    blogPages = posts.map((post) => ({
      url: `${SITE}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently fail
  }

  // Fetch top tokens for indexing (enriched, with safety data)
  let tokenPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createServerSupabase();
    const { data: tokens } = await supabase
      .from('tokens')
      .select('mint, detected_at')
      .eq('enriched', true)
      .not('safety_level', 'is', null)
      .order('detected_at', { ascending: false })
      .limit(200);

    if (tokens) {
      tokenPages = tokens.map((t) => ({
        url: `${SITE}/tokens/${t.mint}`,
        lastModified: new Date(t.detected_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Silently fail
  }

  return [...staticPages, ...blogPages, ...tokenPages];
}
