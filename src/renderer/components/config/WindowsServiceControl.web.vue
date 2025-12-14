<template>
  <b-card header="Windows Service Control" class="mb-3">
    <b-alert v-if="!isElectron" variant="info" show>
      Windows Service management is only available in the Electron desktop application.
    </b-alert>
    <b-alert v-else-if="!isWindows" variant="info" show>
      Windows Service management is only available on Windows operating systems.
    </b-alert>
    <template v-else>
      <b-row class="mb-3">
        <b-col md="6">
          <b-form-group label="Service Name">
            <b-form-input v-model="serviceName" placeholder="CasparCG" />
          </b-form-group>
        </b-col>
        <b-col md="6">
          <b-form-group label="Display Name">
            <b-form-input v-model="displayName" placeholder="CasparCG Server" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col md="12">
          <b-form-group label="Executable Path">
            <b-input-group>
              <b-form-input v-model="exePath" placeholder="C:\CasparCG\casparcg.exe" />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="browsePath">
                  <i class="fa fa-folder-open"></i>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col md="12">
          <b-form-group label="Description">
            <b-form-input v-model="description" placeholder="CasparCG Server Windows Service" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col>
          <div class="d-flex align-items-center">
            <span class="mr-3">Status:</span>
            <b-badge :variant="statusVariant">{{ statusText }}</b-badge>
            <b-button variant="link" size="sm" @click="refreshStatus" class="ml-2">
              <i class="fa fa-refresh"></i>
            </b-button>
          </div>
        </b-col>
      </b-row>
      <b-alert v-if="statusMessage" :variant="statusAlertVariant" show>
        {{ statusMessage }}
      </b-alert>
      <hr />
      <div class="d-flex flex-wrap gap-2">
        <b-button
          variant="success"
          :disabled="isOperating || status === 'running'"
          @click="startService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-play"></i> Start
        </b-button>
        <b-button
          variant="warning"
          :disabled="isOperating || status === 'stopped' || status === 'not_installed'"
          @click="stopService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-stop"></i> Stop
        </b-button>
        <b-button
          variant="primary"
          :disabled="isOperating || status === 'installed' || status === 'running'"
          @click="installService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-download"></i> Install
        </b-button>
        <b-button
          variant="danger"
          :disabled="isOperating || status === 'not_installed'"
          @click="uninstallService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-trash"></i> Uninstall
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
export default {
  name: 'WindowsServiceControl',
  data() {
    return {
      serviceName: 'CasparCG',
      displayName: 'CasparCG Server',
      description: 'CasparCG Server Windows Service',
      exePath: '',
      status: 'unknown',
      statusMessage: '',
      isOperating: false,
    }
  },
  computed: {
    isElectron() {
      return typeof window !== 'undefined' && window.ipcRenderer !== undefined
    },
    isWindows() {
      return navigator.platform.toLowerCase().includes('win')
    },
    statusVariant() {
      switch (this.status) {
        case 'running':
          return 'success'
        case 'stopped':
          return 'secondary'
        case 'installed':
          return 'info'
        case 'not_installed':
          return 'warning'
        case 'error':
          return 'danger'
        case 'installing':
        case 'uninstalling':
        case 'starting':
        case 'stopping':
          return 'primary'
        default:
          return 'secondary'
      }
    },
    statusText() {
      switch (this.status) {
        case 'running':
          return 'Running'
        case 'stopped':
          return 'Stopped'
        case 'installed':
          return 'Installed'
        case 'not_installed':
          return 'Not Installed'
        case 'installing':
          return 'Installing...'
        case 'uninstalling':
          return 'Uninstalling...'
        case 'starting':
          return 'Starting...'
        case 'stopping':
          return 'Stopping...'
        case 'error':
          return 'Error'
        default:
          return 'Unknown'
      }
    },
    statusAlertVariant() {
      return this.status === 'error' ? 'danger' : 'info'
    },
  },
  mounted() {
    if (this.isElectron && this.isWindows) {
      window.ipcRenderer.on('windowsService.status', this.handleStatusUpdate)
      this.refreshStatus()
    }
  },
  beforeDestroy() {
    if (this.isElectron) {
      window.ipcRenderer.removeListener('windowsService.status', this.handleStatusUpdate)
    }
  },
  methods: {
    handleStatusUpdate(event, data) {
      try {
        const statusData = typeof data === 'string' ? JSON.parse(data) : data
        this.status = statusData.status
        this.statusMessage = statusData.message
        this.isOperating = ['installing', 'uninstalling', 'starting', 'stopping'].includes(statusData.status)
      } catch (e) {
        console.error('Failed to parse status update:', e)
      }
    },
    sendCommand(cmd, param) {
      if (this.isElectron) {
        window.ipcRenderer.send('windowsService.control', cmd, param)
      }
    },
    getServiceConfig() {
      return {
        serviceName: this.serviceName,
        displayName: this.displayName,
        description: this.description,
        exePath: this.exePath,
      }
    },
    refreshStatus() {
      this.sendCommand('configure', this.getServiceConfig())
      this.sendCommand('status')
    },
    startService() {
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('start')
    },
    stopService() {
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('stop')
    },
    installService() {
      if (!this.exePath) {
        this.status = 'error'
        this.statusMessage = 'Please specify the executable path'
        return
      }
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('install', this.getServiceConfig())
    },
    uninstallService() {
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('uninstall')
    },
    browsePath() {
      if (this.isElectron) {
        window.ipcRenderer.send('dialog.openFile', {
          filters: [{ name: 'Executables', extensions: ['exe'] }],
        })
        window.ipcRenderer.once('dialog.openFile.result', (event, result) => {
          if (result && result.filePaths && result.filePaths.length > 0) {
            this.exePath = result.filePaths[0]
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.gap-2 > * {
  margin-right: 0.5rem;
}
</style>
