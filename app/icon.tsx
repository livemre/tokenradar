import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '40px',
        }}
      >
        {/* Radar circle */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: '3px solid rgba(0, 255, 136, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 136, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
