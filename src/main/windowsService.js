import log from 'electron-log'
import { execFile } from 'child_process'
import sudo from 'sudo-prompt'

function isValidServiceName(name) {
  return /^[a-zA-Z0-9_\- ]+$/.test(name)
}

function runElevated(command, name) {
  return new Promise((resolve, reject) => {
    sudo.exec(command, { name: name || 'CasparCG Launcher' }, (error, stdout, stderr) => {
      if (error) {
        log.error('[WindowsService] Elevated command failed: ' + error.message)
        return reject(error)
      }
      resolve({ stdout: stdout || '', stderr: stderr || '' })
    })
  })
}

export class WindowsServiceManager {
  constructor(ipcWrapper) {
    this.ipcWrapper = ipcWrapper
    this.serviceName = 'CasparCG'
    this.serviceConfig = null

    this.ipcWrapper.on('windowsService.control', (sender, cmd, param) => {
      log.info('[WindowsService] Got control command: ' + cmd)
      switch (cmd) {
        case 'install':
          this.install(param)
          break
        case 'uninstall':
          this.uninstall()
          break
        case 'start':
          this.start()
          break
        case 'stop':
          this.stop()
          break
        case 'status':
          if (param) this.configure(param)
          this.getStatus()
          break
        case 'configure':
          this.configure(param)
          break
      }
    })
  }

  sendStatus(status, message) {
    this.ipcWrapper.send('windowsService.status', JSON.stringify({ status, message }))
  }

  configure(config) {
    this.serviceConfig = config
    const name = (config && config.serviceName) || 'CasparCG'
    if (!isValidServiceName(name)) {
      log.error('[WindowsService] Invalid service name: ' + name)
      this.sendStatus('error', 'Invalid service name. Only letters, numbers, spaces, hyphens and underscores allowed.')
      return
    }
    this.serviceName = name
    log.info('[WindowsService] Configured service: ' + this.serviceName)
  }

  async install(config) {
    if (config) {
      this.configure(config)
    }

    if (!this.serviceConfig || !this.serviceConfig.exePath) {
      this.sendStatus('error', 'No executable path configured')
      return
    }

    const exePath = this.serviceConfig.exePath
    const serviceName = this.serviceName
    const displayName = this.serviceConfig.displayName || serviceName
    const description = this.serviceConfig.description || 'CasparCG Launcher Windows Service'

    log.info('[WindowsService] Installing service: ' + serviceName)
    this.sendStatus('installing', 'Installing service (UAC prompt)...')

    const quotedExe = `\\"${exePath}\\"`
    const createCmd = `sc.exe create "${serviceName}" binPath= "${quotedExe}" start= auto DisplayName= "${displayName}"`
    const descCmd = `sc.exe description "${serviceName}" "${description.replace(/"/g, '\\"')}"`
    const startCmd = `sc.exe start "${serviceName}"`

    try {
      const combined = `${createCmd} && ${descCmd} && ${startCmd}`
      const { stdout, stderr } = await runElevated(combined, 'CasparCG Launcher')
      log.info('[WindowsService] Install output: ' + stdout)
      if (stderr) log.warn('[WindowsService] Install stderr: ' + stderr)
      this.sendStatus('installed', 'Service installed and started successfully')
      setTimeout(() => this.getStatus(), 1000)
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      if (msg.includes('User did not grant permission')) {
        this.sendStatus('error', 'Administrator permission denied')
      } else {
        this.sendStatus('error', 'Install failed: ' + msg)
      }
    }
  }

  async uninstall() {
    log.info('[WindowsService] Uninstalling service: ' + this.serviceName)
    this.sendStatus('uninstalling', 'Uninstalling service (UAC prompt)...')

    const serviceName = this.serviceName
    const stopCmd = `sc.exe stop "${serviceName}"`
    const deleteCmd = `sc.exe delete "${serviceName}"`

    try {
      const combined = `${stopCmd} & ${deleteCmd}`
      const { stdout, stderr } = await runElevated(combined, 'CasparCG Launcher')
      log.info('[WindowsService] Uninstall output: ' + stdout)
      if (stderr) log.warn('[WindowsService] Uninstall stderr: ' + stderr)
      this.sendStatus('uninstalled', 'Service uninstalled successfully')
      setTimeout(() => this.getStatus(), 1000)
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      if (msg.includes('User did not grant permission')) {
        this.sendStatus('error', 'Administrator permission denied')
      } else {
        this.sendStatus('error', 'Uninstall failed: ' + msg)
      }
    }
  }

  start() {
    log.info('[WindowsService] Starting service: ' + this.serviceName)
    this.sendStatus('starting', 'Starting service...')

    execFile('sc', ['start', this.serviceName], (error, stdout, stderr) => {
      if (error) {
        log.error('[WindowsService] Start failed: ' + stderr)
        this.sendStatus('error', 'Start failed: ' + stderr)
        return
      }
      log.info('[WindowsService] Service started')
      this.sendStatus('running', 'Service started')
    })
  }

  stop() {
    log.info('[WindowsService] Stopping service: ' + this.serviceName)
    this.sendStatus('stopping', 'Stopping service...')

    execFile('sc', ['stop', this.serviceName], (error, stdout, stderr) => {
      if (error) {
        log.error('[WindowsService] Stop failed: ' + stderr)
        this.sendStatus('error', 'Stop failed: ' + stderr)
        return
      }
      log.info('[WindowsService] Service stopped')
      this.sendStatus('stopped', 'Service stopped')
    })
  }

  getStatus() {
    execFile('sc', ['query', this.serviceName], (error, stdout, stderr) => {
      if (error) {
        const combined = (stdout || '') + (stderr || '')
        if (combined.includes('does not exist') || combined.includes('1060')) {
          this.sendStatus('not_installed', 'Service not installed')
        } else {
          this.sendStatus('error', 'Status check failed: ' + (stderr || error.message))
        }
        return
      }

      if (stdout.includes('RUNNING')) {
        this.sendStatus('running', 'Service is running')
      } else if (stdout.includes('STOPPED')) {
        this.sendStatus('stopped', 'Service is stopped')
      } else {
        this.sendStatus('installed', 'Service is installed')
      }
    })
  }

  isInstalled() {
    return new Promise((resolve) => {
      execFile('sc', ['query', this.serviceName], (error, stdout, stderr) => {
        if (error) {
          const combined = (stdout || '') + (stderr || '')
          if (combined.includes('does not exist') || combined.includes('1060')) {
            return resolve(false)
          }
        }
        resolve(true)
      })
    })
  }
}
