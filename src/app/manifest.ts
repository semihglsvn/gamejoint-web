import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GameJoint',
    short_name: 'GameJoint',
    description: 'The Ultimate Video Game Database and Review Community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#55C72E', // The joint-green
    icons: [
      {
        src: '/logo.svg', // Ensure you have this in your /public folder
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}