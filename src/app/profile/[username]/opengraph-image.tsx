import { ImageResponse } from 'next/og';
import { getPublicProfile } from '@/lib/api';

export const alt = 'GameJoint User Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const user = await getPublicProfile(username).catch(() => null);

  if (!user) {
    return new Response('Not found', { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${appUrl}/logo.svg`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#121212',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Single prominent logo at the top */}
        <img src={logoUrl} style={{ height: '90px', marginBottom: '50px' }} />
        
        <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: 'white', margin: '0' }}>
          {user.username}
        </h1>
        <p style={{ fontSize: '40px', color: '#55C72E', margin: '20px 0 0 0' }}>
          {user.roleName.toUpperCase()}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '60px' }}>
          <p style={{ fontSize: '32px', color: '#888', margin: '0 12px 0 0' }}>
            View reviews and ratings on
          </p>
          <p style={{ fontSize: '32px', color: '#55C72E', fontWeight: 'bold', margin: '0' }}>
            GameJoint
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}