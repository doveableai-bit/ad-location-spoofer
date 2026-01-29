export default function handler(request) {
  const url = new URL(request.url);
  const location = url.searchParams.get('location') || 'newyork';
  
  // Mock IPs for different locations
  const locationIPs = {
    newyork: ['207.46.13.99', '104.28.0.1'],
    london: ['51.89.0.1', '35.176.0.1'],
    tokyo: ['133.18.0.1', '153.121.0.1'],
    mumbai: ['103.120.0.1', '49.36.0.1']
  };
  
  const ips = locationIPs[location] || locationIPs.newyork;
  const randomIP = ips[Math.floor(Math.random() * ips.length)];
  
  // Create a test URL for the proxy
  const testUrl = encodeURIComponent('https://httpbin.org/headers');
  
  return new Response(JSON.stringify({
    project: "Ad Location Spoofer Proxy",
    status: "✅ Operational",
    serverTime: new Date().toISOString(),
    location: {
      requested: location,
      spoofedIP: randomIP,
      city: location.charAt(0).toUpperCase() + location.slice(1)
    },
    endpoints: {
      proxyTest: `/api/proxy?url=${testUrl}&location=${location}`,
      allLocations: '/api/locations',
      ipLeakTest: `/api/proxy?url=${encodeURIComponent('https://ipinfo.io/json')}&location=${location}`
    },
    quickActions: [
      `Test New York: /api/test?location=newyork`,
      `Test London: /api/test?location=london`,
      `View all locations: /api/locations`
    ]
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Location': location.toUpperCase(),
      'Access-Control-Allow-Origin': '*'
    }
  });
}
