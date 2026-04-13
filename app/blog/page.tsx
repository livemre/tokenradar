import Link from 'next/link';
import { Radar, ArrowRight, BookOpen, Shield, GraduationCap, Newspaper, Clock } from 'lucide-react';
import { getPosts, getCategories } from '@/lib/wordpress';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function decodeHtml(html: string): string {
  return html.replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&amp;/g, "&");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function readingTime(html: string): number {
  const text = stripHtml(html);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string; color: string }> = {
  guides: {
    gradient: 'from-emerald-500/30 via-green-600/20 to-teal-500/10',
    icon: 'guides',
    color: 'text-emerald-400',
  },
  news: {
    gradient: 'from-blue-500/30 via-cyan-600/20 to-sky-500/10',
    icon: 'news',
    color: 'text-blue-400',
  },
  safety: {
    gradient: 'from-orange-500/30 via-red-600/20 to-rose-500/10',
    icon: 'safety',
    color: 'text-orange-400',
  },
  education: {
    gradient: 'from-purple-500/30 via-violet-600/20 to-fuchsia-500/10',
    icon: 'education',
    color: 'text-purple-400',
  },
};

function CategoryIcon({ slug, size = 28 }: { slug?: string; size?: number }) {
  switch (slug) {
    case 'guides': return <BookOpen size={size} />;
    case 'safety': return <Shield size={size} />;
    case 'news': return <Newspaper size={size} />;
    case 'education': return <GraduationCap size={size} />;
    default: return <BookOpen size={size} />;
  }
}

export const metadata = {
  title: 'Blog | TokenRadar',
  description: 'Solana token trading guides, safety tips, and ecosystem news from TokenRadar.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const categorySlug = params.category;

  const [categories, postsResult] = await Promise.all([
    getCategories(),
    getPosts({
      page,
      perPage: 12,
      categories: categorySlug
        ? (await getCategories()).find((c) => c.slug === categorySlug)?.id
        : undefined,
    }),
  ]);

  const { posts, totalPages } = postsResult;
  const activeCategories = categories.filter((c) => c.count > 0 && c.slug !== 'uncategorized');

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Radar size={22} className="text-safe" />
            <span className="font-bold text-lg">
              Token<span className="text-gradient-brand">Radar</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/tokens"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-safe/10 text-safe text-sm font-semibold hover:bg-safe/20 transition-all btn-press"
            >
              Launch App
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-muted mb-4">
            <BookOpen size={12} />
            TokenRadar Blog
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Insights & <span className="text-gradient-brand">Guides</span>
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Learn about Solana trading, token safety, and the latest from the ecosystem.
          </p>
        </div>

        {/* Category filter */}
        {activeCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all btn-press ${
                !categorySlug
                  ? 'bg-safe/10 text-safe border border-safe/20'
                  : 'bg-white/[0.04] text-muted border border-white/5 hover:text-foreground'
              }`}
            >
              All
            </Link>
            {activeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all btn-press ${
                  categorySlug === cat.slug
                    ? 'bg-safe/10 text-safe border border-safe/20'
                    : 'bg-white/[0.04] text-muted border border-white/5 hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={32} className="mx-auto text-muted mb-4" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm text-muted mt-1">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured post - large card */}
            {featuredPost && (() => {
              const fCat = featuredPost._embedded?.['wp:term']?.[0]?.[0];
              const fStyle = CATEGORY_STYLES[fCat?.slug || ''] || CATEGORY_STYLES.guides;
              const fMinutes = readingTime(featuredPost.content.rendered);
              return (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all"
                >
                  {/* Gradient hero */}
                  <div className={`relative h-48 sm:h-64 bg-gradient-to-br ${fStyle.gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className={`${fStyle.color} opacity-20 group-hover:opacity-30 transition-opacity`}>
                      <CategoryIcon slug={fCat?.slug} size={80} />
                    </div>
                    {fCat && (
                      <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-sm ${fStyle.color}`}>
                        {fCat.name}
                      </span>
                    )}
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white/70 flex items-center gap-1">
                      <Clock size={11} />
                      {fMinutes} min read
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-6 sm:p-8 bg-white/[0.02]">
                    <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:text-safe transition-colors">
                      {decodeHtml(featuredPost.title.rendered)}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
                      {stripHtml(featuredPost.excerpt.rendered).slice(0, 200)}
                    </p>
                    <div className="flex items-center justify-between">
                      <time className="text-xs text-muted">{formatDate(featuredPost.date)}</time>
                      <span className="text-sm text-safe font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Read article <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Other posts - grid */}
            {otherPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherPosts.map((post) => {
                  const category = post._embedded?.['wp:term']?.[0]?.[0];
                  const style = CATEGORY_STYLES[category?.slug || ''] || CATEGORY_STYLES.guides;
                  const minutes = readingTime(post.content.rendered);
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all flex flex-col"
                    >
                      {/* Gradient thumbnail */}
                      <div className={`relative h-36 bg-gradient-to-br ${style.gradient} flex items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        <div className={`${style.color} opacity-15 group-hover:opacity-25 transition-opacity`}>
                          <CategoryIcon slug={category?.slug} size={48} />
                        </div>
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-sm text-white/70 flex items-center gap-1">
                          <Clock size={9} />
                          {minutes} min
                        </span>
                      </div>
                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1 bg-white/[0.02]">
                        {category && (
                          <span className={`text-xs font-semibold ${style.color} mb-2`}>{category.name}</span>
                        )}
                        <h2 className="text-base font-semibold leading-snug mb-2 group-hover:text-safe transition-colors flex-1">
                          {decodeHtml(post.title.rendered)}
                        </h2>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">
                          {stripHtml(post.excerpt.rendered).slice(0, 120)}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <time className="text-[11px] text-muted">{formatDate(post.date)}</time>
                          <span className="text-xs text-safe font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            Read <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-all btn-press"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-all btn-press"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
            <Radar size={14} className="text-safe" />
            TokenRadar
          </Link>
          <p className="text-[10px] text-muted mt-2">Data provided as-is. DYOR.</p>
        </div>
      </footer>
    </div>
  );
}
