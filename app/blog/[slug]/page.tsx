import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import sanitize from 'sanitize-html';
import { Radar, ArrowLeft, ArrowRight, Calendar, Tag, Clock, BookOpen, Shield, Newspaper, GraduationCap } from 'lucide-react';
import { getPost, getPosts } from '@/lib/wordpress';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

function decodeHtml(html: string): string {
  return html.replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function readingTime(html: string): number {
  const text = stripHtml(html);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const CATEGORY_STYLES: Record<string, { gradient: string; color: string }> = {
  guides: { gradient: 'from-emerald-500/30 via-green-600/20 to-teal-500/10', color: 'text-emerald-400' },
  news: { gradient: 'from-blue-500/30 via-cyan-600/20 to-sky-500/10', color: 'text-blue-400' },
  safety: { gradient: 'from-orange-500/30 via-red-600/20 to-rose-500/10', color: 'text-orange-400' },
  education: { gradient: 'from-purple-500/30 via-violet-600/20 to-fuchsia-500/10', color: 'text-purple-400' },
};

function sanitizeContent(html: string): string {
  const clean = sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat(['iframe', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption']),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'style'],
      figure: ['style'],
      figcaption: ['style'],
      div: ['style'],
      '*': ['id', 'class', 'style'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com'],
  });
  return clean.replace(
    /<h2([^>]*)>(.*?)<\/h2>/gi,
    (_match: string, attrs: string, content: string) => {
      const text = content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
      const anchor = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<h2${attrs} id="${anchor}">${content}</h2>`;
    }
  );
}

function CategoryIcon({ slug, size = 28 }: { slug?: string; size?: number }) {
  switch (slug) {
    case 'guides': return <BookOpen size={size} />;
    case 'safety': return <Shield size={size} />;
    case 'news': return <Newspaper size={size} />;
    case 'education': return <GraduationCap size={size} />;
    default: return <BookOpen size={size} />;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found | TokenRadar' };

  const title = decodeHtml(post.title.rendered);
  const description = stripHtml(post.excerpt.rendered).slice(0, 160);

  return {
    title: `${title} | TokenRadar Blog`,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://tokenradar.site/blog/${slug}`,
      siteName: 'TokenRadar',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | TokenRadar Blog`,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const category = post._embedded?.['wp:term']?.[0]?.[0];
  const title = decodeHtml(post.title.rendered);
  const style = CATEGORY_STYLES[category?.slug || ''] || CATEGORY_STYLES.guides;
  const minutes = readingTime(post.content.rendered);

  // Get related posts from same category
  const related = category
    ? await getPosts({ perPage: 3, categories: category.id })
    : { posts: [] };
  const relatedPosts = related.posts.filter((p) => p.id !== post.id).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: post.date,
    dateModified: post.modified,
    url: `https://tokenradar.site/blog/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'TokenRadar',
      url: 'https://tokenradar.site',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tokenradar.site/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
            <Link href="/blog" className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block">
              Blog
            </Link>
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

      {/* Hero banner */}
      <div className={`relative bg-gradient-to-br ${style.gradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            {category && (
              <Link
                href={`/blog?category=${category.slug}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/30 backdrop-blur-sm ${style.color} hover:bg-black/40 transition-colors`}
              >
                <CategoryIcon slug={category.slug} size={12} />
                {category.name}
              </Link>
            )}
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-sm text-white/60">
              <Clock size={11} />
              {minutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
            {title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(post.date)}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Table of Contents */}
        {minutes >= 8 && (() => {
          const headings = post.content.rendered.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
          if (headings.length < 3) return null;
          return (
            <nav className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
                <BookOpen size={14} />
                Table of Contents
              </h2>
              <ol className="space-y-2">
                {headings.map((h, i) => {
                  const text = h.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
                  const anchor = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  return (
                    <li key={i}>
                      <a
                        href={`#${anchor}`}
                        className="text-sm text-muted hover:text-safe transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-5 h-5 rounded-full bg-safe/10 text-safe text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {text}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          );
        })()}

        {/* Article content */}
        <article>
          <div
            className="blog-prose prose prose-invert prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[#b0b0b0] prose-p:leading-relaxed prose-p:text-base
              prose-strong:text-foreground
              prose-li:text-[#b0b0b0]
              prose-img:rounded-xl prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(post.content.rendered),
            }}
          />
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-white/5">
            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => {
                const rpCat = rp._embedded?.['wp:term']?.[0]?.[0];
                const rpStyle = CATEGORY_STYLES[rpCat?.slug || ''] || CATEGORY_STYLES.guides;
                const rpMin = readingTime(rp.content.rendered);
                return (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all"
                  >
                    <div className={`h-24 bg-gradient-to-br ${rpStyle.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className={`${rpStyle.color} opacity-15`}>
                        <CategoryIcon slug={rpCat?.slug} size={36} />
                      </div>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] bg-black/40 backdrop-blur-sm text-white/60 flex items-center gap-1">
                        <Clock size={9} />
                        {rpMin} min
                      </span>
                    </div>
                    <div className="p-4 bg-white/[0.02]">
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-safe transition-colors mb-2">
                        {decodeHtml(rp.title.rendered)}
                      </h3>
                      <time className="text-[11px] text-muted">{formatDate(rp.date)}</time>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 rounded-2xl border border-white/[0.06] p-8 text-center bg-gradient-to-br from-safe/[0.06] to-accent/[0.04]">
          <h2 className="text-xl font-bold mb-2">Ready to start scanning?</h2>
          <p className="text-sm text-muted mb-4">
            Track new Solana tokens in real-time with TokenRadar.
          </p>
          <Link
            href="/tokens"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4aa] text-black font-bold hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all btn-press"
          >
            Launch TokenRadar
            <ArrowRight size={16} />
          </Link>
        </section>
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
