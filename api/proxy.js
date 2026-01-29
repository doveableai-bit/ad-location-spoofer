export default async function handler(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const location = url.searchParams.get('location') || 'newyork';
  const mode = url.searchParams.get('mode') || 'web'; // 'web' or 'api'

  // 1. VALIDATE INPUT
  if (!targetUrl) {
    return new Response('❌ Error: Missing required parameter "url". Example: /api/proxy?url=https://example.com', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Security: Prevent proxy loops or access to internal services
  const decodedUrl = decodeURIComponent(targetUrl);
  const urlObj = new URL(decodedUrl);
  const blockedHosts = ['localhost', '127.0.0.1', '192.168.', '10.', '169.254.', '::1'];
  if (blockedHosts.some(blocked => urlObj.hostname.includes(blocked))) {
    return new Response('❌ Error: Access to local or internal resources is not allowed.', { status: 403 });
  }

  // 2. LOCATION-BASED CONFIGURATION
  const locationConfig = {
    newyork: {
      ips: ['207.46.13.99', '104.28.0.1', '23.101.0.1', '172.217.0.1'],
      language: 'en-US,en;q=0.9',
      timezone: 'America/New_York',
      city: 'New York'
    },
    london: {
      ips: ['51.89.0.1', '35.176.0.1', '18.130.0.1', '3.10.0.1'],
      language: 'en-GB,en;q=0.9',
      timezone: 'Europe/London',
      city: 'London'
    },
    tokyo: {
      ips: ['133.18.0.1', '153.121.0.1', '210.248.0.1'],
      language: 'ja-JP,ja;q=0.9,en;q=0.8',
      timezone: 'Asia/Tokyo',
      city: 'Tokyo'
    }
  };

  const config = locationConfig[location] || locationConfig.newyork;
  const randomIP = config.ips[Math.floor(Math.random() * config.ips.length)];

  // 3. FORWARD THE REQUEST WITH SPOOFED HEADERS
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const fetchOptions = {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': mode === 'api' 
          ? 'application/json,application/xml;q=0.9' 
          : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': config.language,
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Forwarded-For': randomIP,
        'X-Real-IP': randomIP,
        'X-Client-IP': randomIP,
        'CF-Connecting-IP': randomIP,
        'X-Timezone': config.timezone,
        'X-City': config.city,
        'Referer': 'https://www.google.com/'
      },
      signal: controller.signal
    };

    // Forward body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = await request.text();
      fetchOptions.headers['Content-Type'] = request.headers.get('Content-Type') || 'application/json';
    }

    const response = await fetch(decodedUrl, fetchOptions);
    clearTimeout(timeout);

    // 4. RETURN THE RESPONSE
    const responseBody = await response.text();
    
    // Add our own header to show the spoofed location
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Spoofed-Location', config.city);
    responseHeaders.set('X-Spoofed-IP', randomIP);
    responseHeaders.set('Access-Control-Allow-Origin', '*'); // For frontend use

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    // 5. ERROR HANDLING
    const errorMessage = error.name === 'AbortError' 
      ? '⏱️ Request timed out. The target server took too long to respond.'
      : `❌ Network Error: ${error.message}`;
    
    return new Response(JSON.stringify({ 
      error: true, 
      message: errorMessage,
      location: config.city 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Error': 'Proxy-Failure'
      }
    });
  }
}
