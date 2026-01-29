import fetch from 'node-fetch';

const RESIDENTIAL_IPS = {
  newyork: [
    '207.46.13.99',      // Microsoft NY
    '104.28.0.1',        // Cloudflare NY  
    '172.67.132.45'      // Real residential
  ],
  london: [
    '51.140.0.1',        // Azure London
    '2.17.44.1',         // Residential UK
    '185.230.63.107'     // Cloudflare London
  ]
};

export default async function handler(req, res) {
  const url = req.query.url;
  const location = req.query.location || 'newyork'; // ny or london
  
  if (!url) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  try {
    const randomIP = RESIDENTIAL_IPS[location][Math.floor(Math.random() * RESIDENTIAL_IPS[location].length)];
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': location === 'newyork' ? 'en-US,en;q=0.9' : 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Forwarded-For': randomIP,
        'X-Real-IP': randomIP,
        'Client-IP': randomIP,
        'CF-Connecting-IP': randomIP,
        'True-Client-IP': randomIP
      }
    });

    const data = await response.text();
    
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Proxied-By', `${location.toUpperCase()} Location`);
    res.status(response.status).send(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
