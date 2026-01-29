// api/test.js - Serverless
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    status: '🟢 ONLINE - Serverless Runtime',
    timestamp: new Date().toISOString(),
    ips: {
      newyork: ['67.161.149.122', '174.138.15.123'],
      london: ['51.15.241.123', '35.176.123.123']
    },
    test: '✅ Buttons will work now!'
  });
}
