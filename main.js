const { app, BrowserWindow } = require('electron');
const http = require('http');
const { exec } = require('child_process');

let mainWindow;

function waitForServer(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      http.get(url, () => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server did not start in time.'));
        } else {
          setTimeout(check, 500);
        }
      });
    };

    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  const serverProcess = exec('npm start', { cwd: __dirname });

  serverProcess.stdout.on('data', data => console.log('[Backend]', data));
  serverProcess.stderr.on('data', data => console.error('[Backend Error]', data));

  waitForServer('http://localhost:3000')
    .then(() => {
      createWindow();
    })
    .catch(err => {
      console.error('Server failed to start:', err);
      app.quit();
    });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      serverProcess.kill();
      app.quit();
    }
  });
});
