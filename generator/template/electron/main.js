const { app, BrowserWindow } = require("electron")
const path = require("path")

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
        try {
            const { installExtension, VUEJS_DEVTOOLS } = require('@tomjs/electron-devtools-installer')
            installExtension(VUEJS_DEVTOOLS)
                .then(ext => console.log(`Added Extension: ${ext.name}`))
                .catch(err => console.log('An error occurred: ', err))
        } catch (e) {
            console.log('DevTools installer not available:', e.message)
        }
    }

    createWindow()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})