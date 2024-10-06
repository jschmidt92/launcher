import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  Tray,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path, { resolve } from "node:path";
// import os, { version } from "node:os";
import os from "node:os";
import { GameDig } from "gamedig";
import { spawn } from "child_process";
import * as fs from "fs";
import * as https from "https";
import extract from "extract-zip";
import log from "electron-log";
import pkg from "electron-updater";
import {
  DownloadProgress,
  GameData,
  ModInfo,
  SettingsData,
} from "../../src/types";

let isGameRunning = false;
let isQuiting: boolean;
let settingsData: any;
let tray: Tray;

const { autoUpdater } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dlServerUp = true;
// const require = createRequire(import.meta.url);
const sPath = path.join(app.getPath("userData"), "settings.json");
const host = {
  protocol: "https://",
  domain: "mod.innovativedevsolutions.org",
  port: 80,
  mods: [
    {
      path: "/@ArmaDragonflyClient.zip",
      versionKey: "dragonfly_version",
      versionUrl: "/dragonfly_version.json",
    },
    {
      path: "/@sof_client.zip",
      versionKey: "sof_client_version",
      versionUrl: "/sof_client_version.json",
    },
    {
      path: "/@sof_mod.zip",
      versionKey: "sof_mod_version",
      versionUrl: "/sof_mod_version.json",
    },
    {
      path: "/@sof_server.zip",
      versionKey: "sof_server_version",
      versionUrl: "/sof_server_version.json",
    },
  ],
};

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const icon = path.join(process.env.VITE_PUBLIC, "icon.ico");

function fetchFileVersion(file: any) {
  return new Promise((resolve, reject) => {
    https
      .get(host.protocol + host.domain + file.versionUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data).version);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function download(
  url: string,
  downloadPath: string,
  progressCallback: (progress: DownloadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download, status code: ${response.statusCode}`)
          );
          return;
        }
        const fileSize = parseInt(
          response.headers["content-length"] || "0",
          10
        );
        let downloadedSize = 0;

        const file = fs.createWriteStream(downloadPath);

        response.on("data", (chunk: Buffer) => {
          downloadedSize += chunk.length;
          file.write(chunk);

          const progress = (downloadedSize / fileSize) * 100;
          progressCallback({
            percent: progress,
            transferred: downloadedSize,
            total: fileSize,
          });

          response.on("end", () => {
            file.end();
            resolve(downloadPath);
          });
        });
      })
      .on("error", (error) => {
        fs.unlink(downloadPath, () => {
          reject(error);
        });
      });
  });
}

async function checkTempModsDirectory(modsDir: string): Promise<void> {
  try {
    await fs.promises.access(modsDir);
  } catch (error) {
    await fs.promises.mkdir(modsDir, { recursive: true });
  }
}

async function downloadAndExtractMod(
  mod: ModInfo,
  modsDir: string,
  arma3path: string
): Promise<void> {
  const url = `${host.protocol}${host.domain}${mod.path}`;
  const downloadPath = path.join(modsDir, path.basename(mod.path));

  try {
    await download(url, downloadPath, (progress) => {
      win.webContents.send("download-progress", progress);
    });

    await extract(downloadPath, { dir: path.resolve(arma3path) });
    await fs.promises.unlink(downloadPath);

    log.info(`Downloaded and extracted mod: ${mod.path}`);
  } catch (error) {
    log.error(`Failed to download and extract mod: ${mod.path}: ${error}`);
    throw error;
  }
}

async function getServerStatus(serverIP: string, serverPort: number) {
  GameDig.query({ type: "arma3", host: serverIP, port: serverPort })
    .then((state: any) => {
      if (dlServerUp) {
        win.webContents.send("server-up", state);
      } else {
        win.webContents.send("server-down", { download: true });
      }
    })
    .catch((error: Error) => {
      win.webContents.send("server-down", { download: false });
    });
}

function launchGame(data: GameData) {
  if (isGameRunning) {
    log.error("Game is already running.");
    return;
  }

  const exePath = path.join(data.arma3path, "arma3_x64.exe");
  const modList: string[] = [
    `-mod="!Workshop/@CBA_A3;!Workshop/@ace;@sof_client;@sof_mod"`,
  ];
  const options: string[] = data.join
    ? [
        `-noSplash -world="empty" -connect=${data.serverIP} -port=${data.serverPort} -password=${data.serverPassword}`,
      ]
    : [`-noSplash -world="empty"`];

  isGameRunning = true;

  const gameProcess = spawn(exePath, [...modList, ...options], {
    detached: true,
  });
  gameProcess.on("exit", () => {
    isGameRunning = false;
  });
}

async function updateSettings(settings: SettingsData) {
  settingsData = {
    ...settingsData,
    ...settings,
    serverPort: Number(settings.serverPort),
  };
  fs.writeFileSync(sPath, JSON.stringify(settingsData, null, 2));
}

function initSettings() {
  const defaultSettings = {
    arma3path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Arma 3",
    serverIP: "127.0.0.1",
    serverPort: 2302,
    serverPassword: "",
  };

  if (fs.existsSync(sPath)) {
    const settings = fs.readFileSync(sPath, "utf8");
    settingsData = JSON.parse(settings);
  } else {
    if (!fs.existsSync(app.getPath("userData"))) {
      fs.mkdirSync(app.getPath("userData"));
    }
    fs.writeFileSync(sPath, JSON.stringify(defaultSettings, null, 2));
    settingsData = defaultSettings;
  }
}

function showNotification(NOTIF_TITLE: string, NOTIF_BODY: string) {
  const NOTIF_ICON = path.join(process.env.VITE_PUBLIC, "icon.ico");
  new Notification({
    title: NOTIF_TITLE,
    body: NOTIF_BODY,
    icon: nativeImage.createFromPath(NOTIF_ICON),
  }).show();
}

log.transports.file.resolvePathFn = () =>
  path.join(app.getPath("userData"), "logs/main.log");
log.log("Appliation Version v" + app.getVersion());

async function createWindow() {
  win = new BrowserWindow({
    title: "PMC Simulator 3.0",
    icon: path.join(process.env.VITE_PUBLIC, "icon.ico"),
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  // win.webContents.setWindowOpenHandler(({ url }) => {
  //   if (url.startsWith("https:")) shell.openExternal(url);
  //   return { action: "deny" };
  // });
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  win.on("close", (_) => {
    if (!isQuiting) {
      const NOTIF_TITLE = "Minimizing App";
      const NOTIF_BODY =
        "App has been minimized to tray, and is running in the background.";
      showNotification(NOTIF_TITLE, NOTIF_BODY);

      _.preventDefault();
      win.hide();
    }
    return false;
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("app-version", app.getVersion());
  });
}

app
  .whenReady()
  .then(() => {
    initSettings();
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
  })
  .then(() => {
    tray = new Tray(nativeImage.createFromPath(icon));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          isQuiting = true;
          app.quit();
        },
      },
    ]);
    tray.setToolTip("PMC Simulator 3.0");
    tray.setContextMenu(contextMenu);
    tray.addListener("click", () => {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    });
  });

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

app.on("before-quit", () => {
  isQuiting = true;
  tray.destroy();
});

app.getFileIcon(icon);
app.setAppUserModelId(process.execPath);

// New window example arg: new windows url
// ipcMain.handle("open-win", (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   if (VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg });
//   }
// });

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.on("download", async (_, data: GameData) => {
  const modsDir = path.join(app.getPath("userData"), "mods");
  await checkTempModsDirectory(modsDir);

  try {
    for (const mod of host.mods) {
      const remoteVersion = await fetchFileVersion(mod);

      if (
        remoteVersion !== settingsData[mod.versionKey] ||
        settingsData[mod.versionKey] === "-1"
      ) {
        log.info(`Updating ${mod.path}...`);
        await downloadAndExtractMod(mod, modsDir, data.arma3path);
        settingsData[mod.versionKey] = remoteVersion;
      } else {
        log.info(`${mod.path} is up to date.`);
      }
    }
    await fs.promises.writeFile(sPath, JSON.stringify(settingsData));
    win.webContents.send("download-complete", { join: data.join });
  } catch (error) {
    log.error(`Error during download process: ${error}`);
    win.webContents.send("serverDown", { download: true });
  }
});

ipcMain.on("launch-game", (_, data: GameData) => {
  launchGame(data);
});

ipcMain.handle("open-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) return;
  return result.filePaths[0];
});

ipcMain.handle("minimize", (_) => {
  _.preventDefault();
  win.hide();
});

ipcMain.handle(
  "refresh-status",
  async (_, serverIP: string, serverPort: number) => {
    const status = await getServerStatus(serverIP, serverPort);
    win.webContents.send("server-status", status);
  }
);

ipcMain.handle(
  "show-notification",
  (_, NOTIF_TITLE: string, NOTIF_BODY: string) => {
    showNotification(NOTIF_TITLE, NOTIF_BODY);
  }
);

ipcMain.handle("update-settings", async (_, settings: SettingsData) => {
  await updateSettings(settings);
  return true;
});
