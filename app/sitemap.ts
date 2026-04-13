import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/wordpress';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://tokenradar.site',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://tokenradar.site/tokens',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: 'https://tokenradar.site/blog',
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
      url: `https://tokenradar.site/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently fail — static pages will still be in the sitemap
  }

  return [...staticPages, ...blogPages];
}
