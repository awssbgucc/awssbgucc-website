import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Built from our own tokens, with no logo (COMPLIANCE rules 4 and 22). CSS variables are not available here.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        background: '#161d26',
        color: '#e8ecf2',
      }}
    >
      <div style={{ display: 'flex', fontSize: 96, letterSpacing: '-0.02em' }}>A campus of builders.</div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: 36, color: '#9aa5b4' }}>{SITE_NAME}</div>
    </div>,
    size,
  );
}
