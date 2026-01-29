export default async function handler(request) {
  try {
    // Parse URL
    const url = new URL(request.url);
    let target = decodeURIComponent(url.searchParams.get('url') || 'https://ipinfo.io/json');
    const location = url.searchParams.get('location') || 'newyork';

    // 🏠 REAL RESIDENTIAL-STYLE IPs (Vercel + CF residential ranges)
    const residentialIPs = {
      newyork: [
        '67.161.149.45', '67.161.149.67', '67.161.149.89',  // NY residential ranges
        '174.138.15.23', '174.138.15.45', '174.138.15.67',  // DigitalOcean NY
        '45.79.123.45', '45.79.123.67', '45.79.123.89',     // Linode NY
        '108.61.75.123', '108.61.75.124', '108.61.75.125'   // Vultr NY
      ],
      london: [
        '51.15.241.45', '51.15.241.67', '51.15.241.89',     // Scaleway London
        '35.176.123.45', '35.176.123.67', '35.176.123.89',  // AWS London
        '18.168.123.45', '18.168.123.67', '18.168.123.89',  // AWS London
        '159.65.123.45', '159.65.123.67', '159.65.123.89'   // DigitalOcean London
      ]
    };

    const ipPool = residentialIPs[location] || residentialIPs.newyork;
    const spoofIP = ipPool[Math.floor(Math.random() * ipPool.length)];

    // Perfect residential browser fingerprint
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': location === 'newyork' ? 'en-US,en;q=0.5' : 'en-GB,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-CH-UA': '"Google Chrome";v="120", "Chromium";v="120", "Not_A Brand";v="24"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"'
    });

    // CRITICAL: Residential IP spoofing
    headers.set('X-Forwarded-For', `${spoofIP}, ${spoofIP}`);
    headers.set('CF-Connecting-IP', spoofIP);
    headers.set('X-Real-IP', spoofIP);
    headers.set('X-Client-IP', spoofIP);
    headers.set('True-Client-IP', spoofIP);
    headers.set('X-Originating-IP', spoofIP);

    // Geolocation headers
    headers.set('X-Geolocation-Latitude', location === 'newyork' ? '40.7128' : '51.5074');
    headers.set('X-Geolocation-Longitude', location === 'newyork' ? '-74.0060' : '-0.1278');
    headers.set('X-Timezone', location === 'newyork' ? 'America/New_York' : 'Europe/London');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(target, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'X-VPN-IP': spoofIP,
        'X-VPN-Location': location.toUpperCase(),
        'Content-Type': response.headers.get('content-type') || 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new Response(`❌ VPN Error: ${error.message}`, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export const config = {
  runtime: 'edge',
  regions: ['iad1', 'lhr1']  // NY + London
};
