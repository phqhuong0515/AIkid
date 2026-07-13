const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPathname = req.url.split('?')[0];
    let decodedUrl = decodeURIComponent(urlPathname);

    // Redirect /me, /mee, or /art to include trailing slash
    if (decodedUrl === '/me' || decodedUrl === '/mee' || decodedUrl === '/art') {
        res.writeHead(301, { 'Location': decodedUrl + '/' });
        res.end();
        return;
    }

    let filePath;
    let baseDir;

    if (decodedUrl.startsWith('/me/') || decodedUrl.startsWith('/mee/')) {
        let subPath = decodedUrl.startsWith('/me/') ? decodedUrl.slice(4) : decodedUrl.slice(5);
        if (subPath === '') {
            subPath = 'index.html';
        }
        baseDir = path.resolve(__dirname, '..', 'SVG');
        filePath = path.join(baseDir, subPath);
    } else if (decodedUrl.startsWith('/art/')) {
        let subPath = decodedUrl.slice(5);
        if (subPath === '') {
            subPath = 'index.html';
        }
        baseDir = path.resolve(__dirname, 'art');
        filePath = path.join(baseDir, subPath);
    } else {
        baseDir = __dirname;
        filePath = path.join(baseDir, decodedUrl === '/' ? 'index.html' : decodedUrl);
    }

    // Security check: ensure path is within the allowed directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    const extname = String(path.extname(resolvedPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(resolvedPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT' || error.code === 'EISDIR') {
                if (!extname) {
                    const cleanHtmlPath = resolvedPath + '.html';
                    fs.readFile(cleanHtmlPath, (cleanError, cleanContent) => {
                        if (!cleanError) {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(cleanContent);
                            return;
                        }
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1><p>Tệp tin không tồn tại.</p>');
                    });
                    return;
                }
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>Tệp tin không tồn tại.</p>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Standing Lobby Server đang chạy thành công!`);
    console.log(`👉 Truy cập tại: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
