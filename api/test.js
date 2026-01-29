// api/test.js - Status endpoint
export const runtime = 'edge';

export default async function handler(req) {
  const spoofIP = '198.41.199.123'; // NY residential
  
  return new Response(JSON.stringify({
    status: '🟢 ONLINE',
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    spoofIP: spoofIP,
    nyIps: ['198.41.199.123', '172.69.70.123'],
    londonIps: ['188.114.96.123', '172.67.132.123'],
    test: 'Proxy ready for ad evasion 👻'
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
