import { ImageResponse } from 'next/og';
import { getGameDetails, formatImageUrl } from '@/lib/api';

export const alt = 'GameJoint Game Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.slug.split('-')[0];
  const game = await getGameDetails(id);

  if (!game) {
    return new Response('Failed to generate image', { status: 404 });
  }

  const coverUrl = formatImageUrl(game.coverImage);

  // Dynamic Metascore Colors
  const score = game.metascore || 0;
  let scoreColor = '#333333'; 
  let textColor = 'white';
  
  if (score >= 75) {
    scoreColor = '#55C72E'; // Green
    textColor = 'black';
  } else if (score >= 50) {
    scoreColor = '#EAB308'; // Yellow/Orange
    textColor = 'black';
  } else if (score > 0) {
    scoreColor = '#EF4444'; // Red
    textColor = 'white';
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#121212',
          width: '100%',
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* FIXED: Perfect 16:9 Aspect Ratio (576x324) */}
        <img
          src={coverUrl}
          style={{
            width: '576px',
            height: '324px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          }}
        />
        
        {/* Text Container */}
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '60px', width: '444px' }}>
          <h1 style={{ fontSize: '56px', color: 'white', fontWeight: 'bold', margin: '0 0 24px 0', lineHeight: 1.1 }}>
            {game.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
            {/* Dynamic Metascore Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: scoreColor, color: textColor, fontWeight: 'bold', fontSize: '32px', width: '80px', height: '80px', borderRadius: '15px' }}>
              {game.metascore || 'N/A'}
            </div>
            
            {/* FIXED: Removed inline logo, restored clean text formatting */}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px' }}>
              <p style={{ fontSize: '24px', color: '#888', margin: '0 0 4px 0' }}>
                Reviewed on
              </p>
              <p style={{ fontSize: '32px', color: '#55C72E', fontWeight: 'bold', margin: '0' }}>
                GameJoint
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}