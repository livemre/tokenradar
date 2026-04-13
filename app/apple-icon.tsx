import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a14 0%, #0d1117 100%)',
          borderRadius: '36px',
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '3px solid rgba(0, 255, 136, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 136, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 24px rgba(0, 255, 136, 0.6)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
