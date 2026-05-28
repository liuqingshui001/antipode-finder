const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};

function start() {
    const server = http.createServer((req, res) => {
        let urlPath = req.url.split('?')[0].split('#')[0];
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = path.join(__dirname, urlPath);

        // Security: prevent path traversal
        const realPath = fs.realpathSync ? fs.realpathSync(filePath) : filePath;
        const rootReal = fs.realpathSync ? fs.realpathSync(__dirname) : __dirname;
        if (!realPath.startsWith(rootReal)) {
            res.writeHead(403); res.end('Forbidden'); return;
        }

        const ext = path.extname(filePath);
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(data);
        });
    });

    server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;

        const win = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 800,
            minHeight: 600,
            title: 'The Other Side of the Earth',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
            backgroundColor: '#0a0e1a',
        });

        win.loadURL(`http://127.0.0.1:${port}`);
        win.setMenuBarVisibility(false);
        win.setTitle('The Other Side of the Earth');

        // F12 for DevTools
        win.webContents.on('before-input-event', (e, input) => {
            if (input.key === 'F12') win.webContents.toggleDevTools();
        });
    });
}

app.whenReady().then(start);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
