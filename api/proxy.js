// api/proxy.js - FIXED RUNTIME + TIMEOUT
export default async function handler(req) {
  try {
    // Parse query params
    const url = req.nextUrl.searchParams.get('url');
    const location = req.nextUrl.searchParams.get('location') || 'newyork';
    
    if (!url) {
      return new Response('❌ Missing "url" parameter', { status: 400 });
    }

    // Residential IP pools
    const ips = {
      newyork: [
        '198.41.199.123', '198.41.199.124', '198.41.199.125', // Cloudflare NY
        '172.69.70.123', '172.69.70.124', '172.69.70.125',   // Vercel NY
        '104.16.248.123', '104.16.248.124', '104.16.248.125' // CF NY
      ],
      london: [
        '188.114.96.123', '188.114.96.124', '188.114.96.125', // CF London
        '172.67.132.123', '172.67.132.124', '172.67.132.125', // CF London
        '104.18.0.123', '104.18.0.124', '104.18.0.125'        // CF London
      ]
    };

    // Pick random residential IP
    const ipPool = ips[location] || ips.newyork;
    const spoofIP = ipPool[Math.floor(Math.random() * ipPool.length)];

    // Forward request with spoofed headers
    const targetUrl = new URL(url);
    const headers = new Headers(req.headers);
    
    // CRITICAL: Spoof residential IPs + geolocation
    headers.set('X-Forwarded-For', `${spoofIP}, ${spoofIP}`);
    headers.set('CF-Connecting-IP', spoofIP);
    headers.set('X-Real-IP', spoofIP);
    headers.set('X-Forwarded-Proto', 'https');
    headers.set('X-Client-IP', spoofIP);
    headers.set('True-Client-IP', spoofIP);
    
    // Location spoofing
    headers.set('X-Geolocation-Latitude', location === 'newyork' ? '40.7128' : '51.5074');
    headers.set('X-Geolocation-Longitude', location === 'newyork' ? '-74.0060' : '-0.1278');
    headers.set('X-Forwarded-Host', targetUrl.host);
    
    // Clean Vercel headers
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-vercel-id');
    headers.delete('x-vercel-ip-country');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
      redirect: 'manual',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Return proxied response
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-cache',
        'Content-Type': response.headers.get('content-type') || 'text/plain'
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`❌ Proxy failed: ${error.message}\n\nStack: ${error.stack}`, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export const config = {
  runtime: 'edge', // FIXED: Edge runtime required
  regions: ['iad1', 'lhr1'], // NY + London regions
  maxDuration: 10
};
