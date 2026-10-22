const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '' || reqPath === '/landing' || reqPath === '/pages/landing') reqPath = '/landing.html';
  if (reqPath === '/founder' || reqPath === '/founders-journey' || reqPath === '/pages/founder') reqPath = '/pages/founder.html';
  if (reqPath === '/healthcare' || reqPath === '/pages/healthcare') reqPath = '/pages/healthcare.html';
  if (reqPath === '/workspace' || reqPath === '/pages/workspace') reqPath = '/pages/workspace.html';
  
  const filePath = path.join(PUBLIC_DIR, reqPath);
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Static server running on http://localhost:${PORT}`);
});
