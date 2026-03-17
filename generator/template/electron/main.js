const { app, BrowserWindow } = require("electron")
const path = require("path")

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

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})