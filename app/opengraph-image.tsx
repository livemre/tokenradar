import { ImageResponse } from 'next/og';

export const alt = 'TokenRadar — Solana Token Radar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a12 0%, #111118 50%, #0d1117 100%)',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Green glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Radar icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(0,255,136,0.1)',
            border: '2px solid rgba(0,255,136,0.2)',
            marginBottom: '32px',
            fontSize: '40px',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
            <path d="M4 6h.01" />
            <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
            <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
            <path d="M12 18h.01" />
            <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
            <circle cx="12" cy="12" r="2" />
            <path d="m13.41 10.59 5.66-5.66" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            fontSize: '64px',
            fontWeight: 800,
            letterSpacing: '-2px',
          }}
        >
          <span style={{ color: '#ededed' }}>Token</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00d4aa)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Radar
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#8b8b8b',
            marginTop: '16px',
            letterSpacing: '-0.5px',
          }}
        >
          Real-time token detection & safety analysis for Solana
        </div>

        {/* Bottom badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '48px',
          }}
        >
          {['Pump.fun', 'Raydium', 'Moonshot'].map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#a0a0a0',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
