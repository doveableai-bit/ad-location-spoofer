export default function handler(request) {
  const locations = {
    newyork: {
      name: "New York, USA",
      ips: ['207.46.13.99', '104.28.0.1', '23.101.0.1'],
      language: 'en-US',
      timezone: 'America/New_York',
      flag: "🇺🇸",
      coordinates: { lat: 40.7128, lon: -74.0060 }
    },
    london: {
      name: "London, UK",
      ips: ['51.89.0.1', '35.176.0.1', '18.130.0.1'],
      language: 'en-GB',
      timezone: 'Europe/London',
      flag: "🇬🇧",
      coordinates: { lat: 51.5074, lon: -0.1278 }
    },
    tokyo: {
      name: "Tokyo, Japan",
      ips: ['133.18.0.1', '153.121.0.1', '210.248.0.1'],
      language: 'ja-JP',
      timezone: 'Asia/Tokyo',
      flag: "🇯🇵",
      coordinates: { lat: 35.6762, lon: 139.6503 }
    },
    mumbai: {
      name: "Mumbai, India",
      ips: ['103.120.0.1', '49.36.0.1'],
      language: 'hi-IN,en',
      timezone: 'Asia/Kolkata',
      flag: "🇮🇳",
      coordinates: { lat: 19.0760, lon: 72.8777 }
    }
  };

  // Return the location data as JSON
  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    availableLocations: locations,
    defaultLocation: 'newyork',
    apiDocumentation: {
      proxyEndpoint: '/api/proxy?url=ENCODED_URL&location=LOCATION',
      testEndpoint: '/api/test?location=LOCATION',
      locationsEndpoint: '/api/locations'
    }
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*'
    }
  });
}
