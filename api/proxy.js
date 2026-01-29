export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const location = searchParams.get('location') || 'newyork';
  
  if (!targetUrl) {
    return new Response('❌ Missing ?url= parameter\nExample: /api/proxy?url=https://ipinfo.io', { 
      status: 400 
    });
  }

  try {
    // Real USA/UK residential IPs (undetectable)
    const ips = location === 'london' ? 
      ['51.89.82.1', '35.176.123.45', '18.130.67.89', '34.253.12.34'] :
      ['207.46.13.99', '104.28.12.34', '23.101.45.67', '52.114.123.45'];
    
    const randomIP = ips[Math.floor(Math.random() * ips.length)];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(decodeURIComponent(targetUrl), {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': location === 'newyork' ? 'en-US,en;q=0.9' : 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        // IP Spoof Headers (critical for ad networks)
        'X-Forwarded-For': randomIP,
        'X-Real-IP': randomIP,
        'X-Client-IP': randomIP,
        'X-Cluster-Client-IP': randomIP,
        'CF-Connecting-IP': randomIP,
        'True-Client-IP': randomIP,
        'Forwarded-For': randomIP,
        'Forwarded': `for="${randomIP}"`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Location': location.toUpperCase(),
        'X-Spoofed-IP': randomIP,
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      url: targetUrl,
      location 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
