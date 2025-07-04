// main.js
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      // security lockdown
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  // point at your built HTML
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
