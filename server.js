const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const API_KEY = '5594329|i1jnjGXnLPSLJTAM7YW4CwEruSJAi272g59ayvDfd6d0020d';
const SHOP_ID = '204708';

function sellAuthRequest(apiPath, callback) {
  const options = {
    hostname: 'api.sellauth.com',
    port: 443,
    path: apiPath,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Accept': 'application/json'
    }
  };

  console.log('[SellAuth] GET https://api.sellauth.com' + apiPath);

  const req = https.request(options, (saRes) => {
    let data = '';
    saRes.on('data', chunk => data += chunk);
    saRes.on('end', () => {
      console.log('[SellAuth] Status:', saRes.statusCode);
      console.log('[SellAuth] Body:', data.substring(0, 400));
      callback(null, saRes.statusCode, data);
    });
  });

  req.on('error', (e) => {
    console.error('[SellAuth] Error:', e.message);
    callback(e);
  });

  req.end();
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  console.log('\n[Request]', req.method, parsed.pathname);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // GET /api/products — hardcoded shop
  if (parsed.pathname === '/api/products') {
    sellAuthRequest('/v1/shops/' + SHOP_ID + '/products', (err, status, data) => {
      if (err) { res.writeHead(502, CORS); res.end(JSON.stringify({ message: 'Proxy error: ' + err.message })); return; }
      res.writeHead(status, CORS);
      res.end(data);
    });
    return;
  }

  // Serve index.html
  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) { res.writeHead(404); res.end('index.html not found — place it in the same folder as server.js'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, CORS);
  res.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   KEYFORGE LOCAL SERVER — RUNNING      ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Open: http://localhost:' + PORT + '           ║');
  console.log('║  Shop ID: ' + SHOP_ID + '                    ║');
  console.log('║  Press Ctrl+C to stop                  ║');
  console.log('╚════════════════════════════════════════╝\n');
});