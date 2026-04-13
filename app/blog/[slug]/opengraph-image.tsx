import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/wordpress';

export const alt = 'TokenRadar Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function decodeHtml(html: string): string {
  return html
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&');
}

const CATEGORY_COLORS: Record<string, string> = {
  guides: '#34d399',
  news: '#60a5fa',
  safety: '#fb923c',
  education: '#a78bfa',
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  const title = post ? decodeHtml(post.title.rendered) : 'Blog Post';
  const category = post?._embedded?.['wp:term']?.[0]?.[0];
  const categoryName = category?.name || 'Article';
  const categoryColor = CATEGORY_COLORS[category?.slug || ''] || '#00ff88';
  const date = post
    ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0a0a12 0%, #111118 50%, #0d1117 100%)',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${categoryColor}, transparent)`,
            display: 'flex',
          }}
        />

        {/* Top section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              borderRadius: '8px',
              background: `${categoryColor}20`,
              border: `1px solid ${categoryColor}40`,
              color: categoryColor,
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {categoryName}
          </div>
          {date && (
            <span style={{ color: '#6b6b6b', fontSize: '16px' }}>{date}</span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? '40px' : '52px',
              fontWeight: 800,
              color: '#ededed',
              lineHeight: 1.2,
              letterSpacing: '-1px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
              <path d="M4 6h.01" />
              <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
              <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
              <path d="M12 18h.01" />
              <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
              <circle cx="12" cy="12" r="2" />
              <path d="m13.41 10.59 5.66-5.66" />
            </svg>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#ededed' }}>
              Token
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00ff88, #00d4aa)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Radar
            </span>
            <span style={{ color: '#6b6b6b', fontSize: '16px', marginLeft: '8px' }}>
              Blog
            </span>
          </div>
          <span style={{ color: '#4b4b4b', fontSize: '14px' }}>tokenradar.site</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
