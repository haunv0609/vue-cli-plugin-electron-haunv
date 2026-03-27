# vue-cli-plugin-electron-haunv

> A Vue CLI plugin for building Windows desktop apps with Electron.

---

## Installation

```bash
vue add electron-haunv
```

After running, the following will be generated:

```
my-app/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script (contextBridge)
├── electron-builder.json
└── ...
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start in development mode with hot-reload |
| `npm run electron:build` | Build a Windows installer |

---

## Configuration

All build settings are in **`electron-builder.json`**:

```json
{
    "appId": "com.haunv.app",
    "productName": "MyApp",
    "directories": {
        "output": "dist_electron"
    },
    "files": [
        "dist/**/*",
        "electron/**/*",
        "package.json"
    ],
    "extraMetadata": {
        "main": "electron/main.js"
    },
    "win": {
        "target": [
            {
                "target": "nsis",
                "arch": [
                    "x64"
                ]
            },
            {
                "target": "portable",
                "arch": [
                    "x64"
                ]
            }
        ]
    },
    "nsis": {
        "oneClick": false,
        "allowToChangeInstallationDirectory": true
    }
}
```

---

## Main Process (`electron/main.js`)

```javascript
const { app, BrowserWindow } = require("electron")
const path = require("path")
const { installExtension, VUEJS_DEVTOOLS } = require('@tomjs/electron-devtools-installer');

const isDevelopment = process.env.NODE_ENV !== 'production'
function createWindow() {

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true
        }
    })

    const isDev = !!process.env.DEV_SERVER_URL

    if (isDev) {
        win.loadURL(process.env.DEV_SERVER_URL)
        win.webContents.openDevTools()
    } else {
        const indexPath = path.join(__dirname, "../dist/index.html")

        win.loadFile(indexPath)
    }
}

app.whenReady().then(async () => {

    if (isDevelopment && !process.env.IS_TEST) {
        installExtension(VUEJS_DEVTOOLS)
        .then(ext => console.log(`Added Extension:  ${ext.name}`))
        .catch(err => console.log('An error occurred: ', err));
    }

    createWindow()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})
```

---

## Preload Script (`electron/preload.js`)

Safely expose APIs from the main process to the renderer (Vue app):

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, (_, ...args) => callback(...args)),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
})
```

Use in any Vue component:

```javascript
window.electronAPI.send('my-event', payload)
window.electronAPI.on('my-response', (data) => console.log(data))
```

> **Note:** Restart `npm run electron:dev` after editing `preload.js`.

---

## Environment Variables

Variables prefixed with `VUE_APP_` are accessible in both the main process and the renderer:

```bash
# .env
VUE_APP_API_URL=https://api.example.com
```

```javascript
console.log(process.env.VUE_APP_API_URL)
```

| Variable | Description |
|----------|-------------|
| `process.env.WEBPACK_DEV_SERVER_URL` | Set in development mode only |
| `process.env.IS_TEST` | `true` when running tests |

---

## Static Assets

Place static files in `public/` and access them via `__static`:

```javascript
// In main.js
import path from 'path'
const icon = path.join(__static, 'icon.png')
```

---

## License

MIT © haunv