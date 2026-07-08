const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // Parse URL and strip query parameters
  const urlPathname = req.url.split('?')[0];
  const decodedUrl = decodeURIComponent(urlPathname);

  // Redirect /me or /mee to include trailing slash
  if (decodedUrl === '/me' || decodedUrl === '/mee') {
    res.writeHead(301, { 'Location': decodedUrl + '/' });
    res.end();
    return;
  }

  let subPath = decodedUrl;
  if (decodedUrl.startsWith('/me/') || decodedUrl.startsWith('/mee/')) {
    subPath = decodedUrl.startsWith('/me/') ? decodedUrl.slice(4) : decodedUrl.slice(5);
  }

  if (subPath === '/' || subPath === '') {
    subPath = '/index.html';
  }

  const absolutePath = path.join(__dirname, subPath);

  // Security check: ensure the requested file is inside the workspace
  if (!absolutePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(absolutePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(absolutePath);
    stream.on('error', (streamErr) => {
      console.error(streamErr);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/mee`);
});
