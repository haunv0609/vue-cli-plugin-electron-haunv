const { execSync } = require("child_process")

const cache = {}

function getLatestVersion(pkg) {
    if (cache[pkg]) return cache[pkg]

    try {
        const v = execSync(`npm view ${pkg} version`, {
            stdio: ["pipe", "pipe", "ignore"]
        })
            .toString()
            .trim()

        cache[pkg] = v
        return v
    } catch (e) {
        console.warn(`⚠️ Cannot fetch ${pkg}, fallback to latest`)
        return "latest"
    }
}

module.exports = (api) => {

    console.log("🚀 Applying Electron plugin...")

    const electronVersion = getLatestVersion("electron")
    const builderVersion = getLatestVersion("electron-builder")

    console.log("📦 Using versions:")
    console.log("   electron:", electronVersion)
    console.log("   electron-builder:", builderVersion)

    console.log("⚡ Installing dependencies may take a moment...")

    api.extendPackage({

        main: "electron/main.js",

        scripts: {
            "electron:dev": "node node_modules/vue-cli-plugin-electron-haunv/bin/dev-runner.js",
            "electron:build": "npm run build && electron-builder --config electron-builder.json"
        },

        devDependencies: {
            electron: `^${electronVersion}`,
            "electron-builder": `^${builderVersion}`,
            "@tomjs/electron-devtools-installer": "^4.0.1"
        }

    })

    api.render('./template')

    api.onCreateComplete(() => {
        const fs = require("fs")
        const configPath = api.resolve("vue.config.js")

        setTimeout(() => {
            if (!fs.existsSync(configPath)) {
                console.log("⚠️ vue.config.js not found")
                return
            }

            let content = fs.readFileSync(configPath, "utf-8")

            if (content.includes("publicPath")) {
                console.log("ℹ️ already has publicPath")
                return
            }

            // 👉 tìm dấu } cuối cùng
            const lastIndex = content.lastIndexOf("}")

            if (lastIndex === -1) {
                console.log("❌ cannot find end of config")
                return
            }

            // 👉 chèn trước dấu }
            content =
                content.slice(0, lastIndex) +
                `,\n  publicPath: "./"\n` +
                content.slice(lastIndex)

            fs.writeFileSync(configPath, content, "utf-8")

            console.log("✅ Inject success REAL")
        }, 500)
    })
}