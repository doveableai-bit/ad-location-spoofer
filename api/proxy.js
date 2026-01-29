export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const location = searchParams.get('location') || 'newyork';

  if (!url) {
    return new Response('❌ Missing ?url=\nExample: /api/proxy?url=https://ipinfo.io/json', { status: 400 });
  }

  const ips = {
    newyork: ['207.46.13.99', '104.28.0.1', '23.101.0.1'],
    london: ['51.89.0.1', '35.176.0.1', '18.130.0.1']
  };

  const ip = ips[location]?.[Math.floor(Math.random() * ips[location].length)] || '207.46.13.99';

  try {
    const response = await fetch(decodeURIComponent(url), {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': location === 'london' ? 'en-GB,en;q=0.9' : 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Forwarded-For': ip,
        'X-Real-IP': ip,
        'X-Client-IP': ip,
        'CF-Connecting-IP': ip,
        'True-Client-IP': ip
      }
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'X-Spoofed-IP': ip,
        'X-Location': location.toUpperCase(),
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
