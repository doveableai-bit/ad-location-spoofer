export default function handler(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'newyork';

  const ips = location === 'london' ? 
    ['51.89.0.1', '35.176.0.1'] : 
    ['207.46.13.99', '104.28.0.1'];

  const ip = ips[Math.floor(Math.random() * ips.length)];

  return new Response(JSON.stringify({
    status: '✅ LIVE',
    location: location.toUpperCase(),
    spoofedIP: ip,
    test: [
      `https://ad-location-spoofer.vercel.app/api/proxy?url=https://ipinfo.io/json&location=${location}`,
      `/api/proxy?url=https://httpbin.org/ip&location=${location}`
    ]
  }, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
