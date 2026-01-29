const RESIDENTIAL_IPS = {
  newyork: ['207.46.13.99', '104.28.0.1', '172.67.132.45'],
  london: ['51.140.0.1', '2.17.44.1', '185.230.63.107']
};

export default function handler(req, res) {
  const location = req.query.location || 'newyork';
  const ip = RESIDENTIAL_IPS[location][Math.floor(Math.random() * RESIDENTIAL_IPS[location].length)];
  
  res.json({
    location,
    ip,
    userAgent: 'Chrome/Windows 10',
    timestamp: new Date().toISOString()
  });
}
