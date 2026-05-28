/**
 * 地球的另一边 - 本地开发服务器
 * 
 * 用法: node server.js
 * 访问: http://localhost:3000
 * 
 * 为什么需要这个?
 * 浏览器从 file:// 打开 HTML 时，会阻止 fetch() 请求外部 API（CORS策略）。
 * 用这个服务器启动后，从 http://localhost:3000 访问即可正常使用。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
    // Map URL to file path
    let filePath = req.url === '/'
        ? path.join(__dirname, 'index.html')
        : path.join(__dirname, req.url);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500 Internal Server Error');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('  🌍 地球的另一边 · Antipode Finder');
    console.log('  ─────────────────────────────────');
    console.log(`  本地地址: http://localhost:${PORT}`);
    console.log(`  局域网:   http://${getLocalIP()}:${PORT}`);
    console.log('');
    console.log('  按 Ctrl+C 停止服务器');
    console.log('');
});

function getLocalIP() {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}
