const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow = null;

app.whenReady().then(() => {
    // Intercept /api/* requests and proxy them through the main process
    session.defaultSession.webRequest.onBeforeSendHeaders({ urls: [] }, (details, cb) => { cb({}); });

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'The Other Side of the Earth',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,  // allow cross-origin requests from file://
        },
        backgroundColor: '#0a0e1a',
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setTitle('The Other Side of the Earth');

    // Open DevTools on F12 for debugging
    mainWindow.webContents.on('before-input-event', (e, input) => {
        if (input.key === 'F12') mainWindow.webContents.toggleDevTools();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
