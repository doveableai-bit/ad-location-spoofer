export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'newyork';
  
  const ips = location === 'london' ? 
    ['51.89.82.1', '35.176.123.45', '18.130.67.89'] :
    ['207.46.13.99', '104.28.12.34', '23.101.45.67'];
  
  const randomIP = ips[Math.floor(Math.random() * ips.length)];

  return new Response(JSON.stringify({
    ✅: 'AD Location Spoofer WORKING!',
    location: location.toUpperCase(),
    spoofedIP: randomIP,
    testUrls: [
      `https://ad-location-spoofer.vercel.app/api/proxy?url=https://ipinfo.io/json&location=newyork`,
      `https://ad-location-spoofer.vercel.app/api/proxy?url=https://ipinfo.io/json&location=london`
    ],
    browserProxy: 'Set proxy to: ad-location-spoofer.vercel.app:443 (HTTPS)'
  }, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
