# 🛡️ Advanced Ad Location Spoofer

A sophisticated proxy server for testing ads, websites, and APIs from different geographic locations with spoofed residential IP addresses. Deployed on Vercel Serverless Functions.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Vercel](https://vercelbadge.vercel.app/api/doveableai-bit/ad-location-spoofer)

## ✨ Features

- **Multiple Locations**: New York, London, Tokyo, Mumbai (easily extendable)
- **Residential IP Spoofing**: Appear to browse from residential IPs in chosen locations
- **Full Header Control**: Custom User-Agent, Accept-Language, Timezone headers
- **Interactive Web UI**: Beautiful dashboard for testing and configuration
- **RESTful API**: Simple endpoints for programmatic use
- **CORS Enabled**: Use directly from web applications
- **Error Handling**: Graceful timeout and error management

## 🚀 Quick Start

### 1. Using the Web Interface
Visit your deployed site and:
1. Select a location (New York, London, Tokyo, Mumbai)
2. Enter a test URL or use the default
3. Click "Run Test" or "Test Proxy"

### 2. Using the API Directly

```javascript
// Test the proxy with a specific location
fetch('https://ad-location-spoofer.vercel.app/api/test?location=london')
  .then(res => res.json())
  .then(data => console.log(data));

// Proxy any URL through a location
const url = encodeURIComponent('https://ipinfo.io/json');
fetch(`https://ad-location-spoofer.vercel.app/api/proxy?url=${url}&location=tokyo`)
  .then(res => res.text())
  .then(data => console.log(data));
