import { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage } from 'electron'
import Conf from 'conf'
import log from 'electron-log'
import fs from 'fs'
import path from 'path'
import OS from 'os'

import { ProcessMonitor } from './process'
import { HttpMonitor } from './http'
import { WindowsServiceManager } from './windowsService'
import { getExeDir, getLogsPath, getBasePath } from './util'

const isProduction = process.env.NODE_ENV !== 'development'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (isProduction) {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

log.transports.file.level = 'info'

process.on('uncaughtException', function (err) {
  log.error('uncaught exception: ', err.stack)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
})

const config = new Conf({
  cwd: getExeDir(),
  configName: 'casparcg-launcher.config',
})

function updateLauncherLogFile() {
  const logBasePath = getLogsPath(config)
  try {
    fs.mkdirSync(logBasePath, { recursive: true })
  } catch (e) {
    // Ignore. It most likely already exists, otherwise below will fail just as well
  }

  const stream = fs.createWriteStream(path.join(logBasePath, 'launcher.log'), { flags: 'a' })
  stream.on('open', () => {
    log.transports.file.stream = stream
  })
  stream.on('error', (e) => {
    log.warn('Failed to update log path: ' + e)
  })
}
updateLauncherLogFile()
log.info('process started')
log.info(`OS uptime since ${new Date(Date.now() - OS.uptime() * 1000).toTimeString()}`)

console.log('Loading config from:', getExeDir())

// Simple versioning for config
const configVersion = config.get('version', 0)
if (configVersion < 1) {
  const processes = []
  processes.push({
    id: 'casparcg',
    name: 'CasparCG',
    exeName: 'casparcg.exe',
    args: config.get('args.casparcg', ''),
    env: [],
    health: config.get('health.casparcg', true) ? 'casparcg' : undefined,
    autoStart: true,
    sendCommands: 'utf16le',
  })
  processes.push({
    id: 'scanner',
    name: 'Media Scanner',
    exeName: 'scanner.exe',
    args: config.get('args.media-scanner', ''),
    env: [],
    autoStart: true,
    sendCommands: undefined,
  })

  if (config.store.exe) {
    const keys = Object.keys(config.store.exe)
    for (let k of keys) {
      processes.push({
        id: k,
        name: k,
        exeName: config.store.exe[k],
        args: config.get('args.' + k, ''),
        env: [],
      })
    }
  }

  config.set('processes', processes)
  config.set('version', 1)

  config.delete('args')
  config.delete('exe')
  config.delete('health')
}
if (configVersion < 2) {
  const processes = config.get('processes')
  for (let process of processes) {
    if (!('sendCommands' in process)) {
      if (process.id === 'scanner') {
        process.sendCommands = undefined
      } else {
        process.sendCommands = 'utf8'
      }
    }
  }

  config.set('processes', processes)
  config.set('version', 2)
}

let mainWindow
let tray = null
let isQuitting = false
let trayAvailable = false
const winURL = !isProduction ? `http://localhost:9080` : `file://${__dirname}/index.html`

function getTrayIconPath() {
  if (isProduction) {
    return path.join(__dirname, '/static/icon.ico')
  }
  return path.join(__dirname, '../../build/icons/icon.ico')
}

function createTray() {
  if (tray) return

  const iconPath = getTrayIconPath()
  let trayIcon
  try {
    trayIcon = nativeImage.createFromPath(iconPath)
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../build/icons/256x256.png'))
    }
  } catch (e) {
    log.warn('Failed to load tray icon: ' + e)
    return
  }

  tray = new Tray(trayIcon)
  trayAvailable = true
  tray.setToolTip('CasparCG Launcher')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    {
      label: 'Fechar',
      click: () => {
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?',
        })
        if (choice === 0) {
          isQuitting = true
          stopProcesses()
          httpMonitor.stop()
          app.quit()
        }
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 768,
    useContentSize: true,
    width: !isProduction ? 1600 : 1024,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  if (isProduction) {
    mainWindow.removeMenu()
  }

  mainWindow.loadURL(winURL)

  mainWindow.on('close', (e) => {
    if (!isQuitting && trayAvailable) {
      e.preventDefault()
      mainWindow.hide()
      return
    }
    log.info('shutting down')
    stopProcesses()
    httpMonitor.stop()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    log.info('closed')
  })

  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault()
  })

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('config', config.store)
    startupProcesses()
  })
}

app.on('before-quit', () => {
  isQuitting = true
})

app.on('ready', () => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  // Do nothing - app stays in tray
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
})

class IpcWrapper {
  constructor(ipcIn, ipcOut) {
    this.ipcIn = ipcIn
    this.ipcOut = ipcOut
  }

  on(event, cb) {
    this.ipcIn.on(event, cb)
  }

  send(event, msg) {
    if (!this.ipcOut.isDestroyed()) {
      this.ipcOut.send(event, msg)
    }
  }
}

let processes = {}
let httpMonitor = new HttpMonitor(config, processes)

function startupProcesses() {
  log.info('Starting child processes')

  const wrapper = new IpcWrapper(ipcMain, mainWindow.webContents)
  wrapper.on('config.get', (e) => {
    e.sender.send('config', config.store)
  })
  wrapper.on('config.set', (e, arg) => {
    config.set(arg)
    e.sender.send('config', config.store)
  })

  wrapper.on('casparcg.config.get', (e) => {
    try {
      const configPath = path.join(getBasePath(config), 'casparcg.config')
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8')
        e.sender.send('casparcg.config.get', content)
      } else {
        e.sender.send('casparcg.config.get', null)
      }
    } catch (err) {
      log.error('Failed to read casparcg.config:', err)
      e.sender.send('casparcg.config.get', null)
    }
  })

  wrapper.on('casparcg.config.set', (e, xmlContent) => {
    try {
      const configPath = path.join(getBasePath(config), 'casparcg.config')
      fs.writeFileSync(configPath, xmlContent, 'utf8')
      e.sender.send('casparcg.config.set', { success: true })
    } catch (err) {
      log.error('Failed to write casparcg.config:', err)
      e.sender.send('casparcg.config.set', { success: false, error: err.message })
    }
  })

  wrapper.on('casparcg.config.path', (e) => {
    try {
      const configPath = path.join(getBasePath(config), 'casparcg.config')
      e.sender.send('casparcg.config.path', configPath)
    } catch (err) {
      log.error('Failed to get casparcg.config path:', err)
      e.sender.send('casparcg.config.path', null)
    }
  })

  wrapper.on('processes.get', (e) => {
    const data = config.get('processes', [])
    const procNames = []
    for (let proc of data) {
      procNames.push({ id: proc.id, name: proc.name || proc.id })
    }

    e.sender.send('processes.get', procNames)
  })

  wrapper.on('openPath', (e, pathId) => {
    try {
      log.info('openPath', pathId)
      if (pathId === 'logsPath') {
        shell.openPath(getLogsPath(config))
      } else if (pathId === 'basePath') {
        shell.openPath(getBasePath(config))
      }
    } catch (e) {
      log.error('Failed to openItem', e)
    }
  })

  function startProcessWithDelayAndDependency(procData) {
    const delay = parseInt(procData.startDelay, 10) || 0
    const dependsOnId = procData.dependsOn || ''

    function doStart() {
      if (delay > 0) {
        log.info(`[${procData.id}] Waiting ${delay}s before auto-start`)
        setTimeout(() => {
          if (processes[procData.id]) {
            processes[procData.id].start()
          }
        }, delay * 1000)
      } else {
        processes[procData.id].start()
      }
    }

    if (dependsOnId && processes[dependsOnId]) {
      log.info(`[${procData.id}] Waiting for dependency: ${dependsOnId}`)
      const checkInterval = setInterval(() => {
        if (processes[dependsOnId] && processes[dependsOnId].running()) {
          clearInterval(checkInterval)
          log.info(`[${procData.id}] Dependency ${dependsOnId} is running`)
          doStart()
        }
      }, 500)
      setTimeout(() => {
        clearInterval(checkInterval)
      }, 120000)
    } else {
      doStart()
    }
  }

  function updateProcesses(data, oldData, coldStart = false) {
    const procNames = []
    const newProcesses = []

    for (let procData of data) {
      procNames.push({ id: procData.id, name: procData.name || procData.id })

      const procConfig = Object.assign(
        {
          basePath: getBasePath(config),
          logsPath: getLogsPath(config),
        },
        procData
      )

      if (!processes[procData.id]) {
        processes[procData.id] = new ProcessMonitor(procData.id, wrapper, procConfig)
        newProcesses.push(procData)
      } else {
        processes[procData.id].updateConfig(procConfig)
      }
    }

    for (let procData of newProcesses) {
      if (!coldStart) {
        processes[procData.id].start()
      } else if (procData.autoStart) {
        startProcessWithDelayAndDependency(procData)
      }
    }

    for (let procData of oldData) {
      if (procNames.find((p) => p.id === procData.id)) continue
      if (!processes[procData.id]) continue

      processes[procData.id].stop()
      delete processes[procData.id]
    }

    wrapper.send('processes.get', procNames)
  }

  function updatePaths() {
    updateLauncherLogFile()

    const data = config.get('processes')
    updateProcesses(data, data)
  }

  const launcherServiceIpcWrapper = {
    on: (event, cb) => {
      const mappedEvent = event.replace('windowsService', 'launcherService')
      wrapper.on(mappedEvent, (sender, cmd, param) => {
        const enrichedParam = Object.assign({}, param || {}, { exePath: process.execPath })
        cb(sender, cmd, enrichedParam)
      })
    },
    send: (event, msg) => {
      wrapper.send(event.replace('windowsService', 'launcherService'), msg)
    },
  }
  new WindowsServiceManager(launcherServiceIpcWrapper)

  config.onDidChange('processes', updateProcesses)
  config.onDidChange('basePath', updatePaths)
  config.onDidChange('logsPath', updatePaths)
  updateProcesses(config.get('processes'), [], true)
}

function stopProcesses() {
  for (let proc in processes) {
    processes[proc].stop()
  }
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
