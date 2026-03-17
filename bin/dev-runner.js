const { spawn } = require("child_process")
const waitOn = require("wait-on")
const getPort = require("get-port").default
const chokidar = require("chokidar")
const kill = require("tree-kill")
const electron = require("electron")

let electronProcess
let port

async function run() {

    port = await getPort({
        port: [8080, 8081, 8082]
    })

    // chạy vue dev server
    spawn(
        "npm",
        ["run", "serve", "--", "--port", port],
        {
            stdio: "inherit",
            shell: true
        }
    )

    // đợi vue ready
    await waitOn({
        resources: [`http://localhost:${port}`]
    })

    // chạy electron
    startElectron()

    // hot reload electron
    chokidar
        .watch(["electron"], { ignoreInitial: true })
        .on("all", () => {
            restartElectron()
        })
}

function startElectron() {
    electronProcess = spawn(
            electron,
            ["."],
        {
            stdio: "inherit",
            env: {
                ...process.env,
                DEV_SERVER_URL: `http://localhost:${port}`
            }
        }
    )

    setupExitListener()
}

function restartElectron() {
    if (electronProcess) {
        kill(electronProcess.pid)
        startElectron()
    }
}

function setupExitListener() {
    if (!electronProcess) return

    electronProcess.on("exit", () => {
        console.log("🛑 Electron closed → stopping dev server...")
        process.exit()
    })
}

run()