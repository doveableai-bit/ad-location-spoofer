// api/proxy.js - VERCEL SERVERLESS (NOT Edge)
export default async function handler(req, res) {
  try {
    // Parse URL params (Vercel Serverless syntax)
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const targetUrl = urlParams.get('url');
    const location = urlParams.get('location') || 'newyork';
    
    if (!targetUrl) {
      res.status(400).json({ error: '❌ Missing "url" parameter' });
      return;
    }

    // Residential IP pools - REAL residential proxies
    const ips = {
      newyork: [
        '67.161.149.122', '67.161.149.123', '67.161.149.124', // NY residential
        '174.138.15.123', '174.138.15.124', '174.138.15.125', // NY residential  
        '45.79.123.123', '45.79.123.124', '45.79.123.125'    // NY residential
      ],
      london: [
        '51.15.241.123', '51.15.241.124', '51.15.241.125',   // London residential
        '35.176.123.123', '35.176.123.124', '35.176.123.125', // London residential
        '18.168.123.123', '18.168.123.124', '18.168.123.125'  // London residential
      ]
    };

    const ipPool = ips[location] || ips.newyork;
    const spoofIP = ipPool[Math.floor(Math.random() * ipPool.length)];

    console.log(`🔄 Proxying ${targetUrl} as ${spoofIP} (${location})`);

    // Proxy request with spoofed headers
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0...',
        'X-Forwarded-For': `${spoofIP}, ${spoofIP}, 127.0.0.1`,
        'CF-Connecting-IP': spoofIP,
        'X-Real-IP': spoofIP,
        'X-Client-IP': spoofIP,
        'True-Client-IP': spoofIP,
        'X-Forwarded-Proto': 'https',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': location === 'newyork' ? 'en-US,en' : 'en-GB,en',
        'X-Geolocation-Latitude': location === 'newyork' ? '40.7128' : '51.5074',
        'X-Geolocation-Longitude': location === 'newyork' ? '-74.0060' : '-0.1278'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!proxyResponse.ok) {
      throw new Error(`Target failed: ${proxyResponse.status}`);
    }

    const body = await proxyResponse.text();

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).send(body);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).send(`❌ Proxy failed: ${error.message}`);
  }
}

// Handle OPTIONS preflight
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};
