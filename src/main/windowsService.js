import log from 'electron-log'
import path from 'path'
import { exec } from 'child_process'

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
          this.getStatus()
          break
        case 'configure':
          this.configure(param)
          break
      }
    })
  }

  configure(config) {
    this.serviceConfig = config
    this.serviceName = config.serviceName || 'CasparCG'
    log.info('[WindowsService] Configured service: ' + this.serviceName)
  }

  install(config) {
    if (config) {
      this.configure(config)
    }

    if (!this.serviceConfig || !this.serviceConfig.exePath) {
      this.sendStatus('error', 'No executable path configured')
      return
    }

    const exePath = this.serviceConfig.exePath
    const serviceName = this.serviceName
    const displayName = this.serviceConfig.displayName || 'CasparCG Server'
    const description = this.serviceConfig.description || 'CasparCG Server Windows Service'

    log.info('[WindowsService] Installing service: ' + serviceName)
    this.sendStatus('installing', 'Installing service...')

    try {
      const Service = require('node-windows').Service
      
      const svc = new Service({
        name: serviceName,
        description: description,
        script: exePath,
        execPath: exePath,
        nodeArgs: [],
        workingDirectory: path.dirname(exePath),
      })

      svc.on('install', () => {
        log.info('[WindowsService] Service installed successfully')
        this.sendStatus('installed', 'Service installed successfully')
        svc.start()
      })

      svc.on('alreadyinstalled', () => {
        log.info('[WindowsService] Service already installed')
        this.sendStatus('installed', 'Service already installed')
      })

      svc.on('error', (err) => {
        log.error('[WindowsService] Error: ' + err)
        this.sendStatus('error', err.toString())
      })

      svc.install()
    } catch (err) {
      log.error('[WindowsService] Install failed: ' + err)
      this.sendStatus('error', 'Install failed: ' + err.toString())
    }
  }

  uninstall() {
    log.info('[WindowsService] Uninstalling service: ' + this.serviceName)
    this.sendStatus('uninstalling', 'Uninstalling service...')

    try {
      const Service = require('node-windows').Service

      const svc = new Service({
        name: this.serviceName,
        script: this.serviceConfig?.exePath || '',
      })

      svc.on('uninstall', () => {
        log.info('[WindowsService] Service uninstalled successfully')
        this.sendStatus('uninstalled', 'Service uninstalled successfully')
      })

      svc.on('error', (err) => {
        log.error('[WindowsService] Error: ' + err)
        this.sendStatus('error', err.toString())
      })

      svc.uninstall()
    } catch (err) {
      log.error('[WindowsService] Uninstall failed: ' + err)
      this.sendStatus('error', 'Uninstall failed: ' + err.toString())
    }
  }

  start() {
    log.info('[WindowsService] Starting service: ' + this.serviceName)
    this.sendStatus('starting', 'Starting service...')

    exec(`sc start "${this.serviceName}"`, (error, stdout, stderr) => {
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

    exec(`sc stop "${this.serviceName}"`, (error, stdout, stderr) => {
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
    exec(`sc query "${this.serviceName}"`, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('does not exist') || stdout.includes('does not exist')) {
          this.sendStatus('not_installed', 'Service not installed')
        } else {
          this.sendStatus('unknown', 'Unable to query service status')
        }
        return
      }

      if (stdout.includes('RUNNING')) {
        this.sendStatus('running', 'Service is running')
      } else if (stdout.includes('STOPPED')) {
        this.sendStatus('stopped', 'Service is stopped')
      } else if (stdout.includes('PENDING')) {
        this.sendStatus('pending', 'Service operation pending')
      } else {
        this.sendStatus('unknown', 'Unknown service status')
      }
    })
  }

  sendStatus(status, message) {
    this.ipcWrapper.send(
      'windowsService.status',
      JSON.stringify({
        serviceName: this.serviceName,
        status: status,
        message: message,
      })
    )
  }
}
