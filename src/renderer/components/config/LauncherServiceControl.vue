<template>
  <b-card header="Launcher Service (Windows)" class="mb-3">
    <b-alert v-if="!isWindows" variant="info" show>
      Windows Service management is only available on Windows operating systems.
    </b-alert>
    <template v-else>
      <b-row class="mb-3">
        <b-col md="6">
          <b-form-group label="Service Name">
            <b-form-input v-model="serviceName" placeholder="CasparCGLauncher" />
          </b-form-group>
        </b-col>
        <b-col md="6">
          <b-form-group label="Display Name">
            <b-form-input v-model="displayName" placeholder="CasparCG Launcher" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col md="12">
          <b-form-group label="Description">
            <b-form-input v-model="description" placeholder="CasparCG Launcher Windows Service" />
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
      <b-alert v-if="statusMessage" :variant="statusAlertVariant" show dismissible @dismissed="statusMessage = ''">
        {{ statusMessage }}
      </b-alert>
      <hr />
      <div class="d-flex flex-wrap">
        <b-button
          variant="primary"
          :disabled="isOperating || status === 'installed' || status === 'running'"
          @click="installService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-download"></i> Install as Service
        </b-button>
        <b-button
          variant="danger"
          :disabled="isOperating || status === 'not_installed'"
          @click="uninstallService"
          class="mr-2 mb-2"
        >
          <i class="fa fa-trash"></i> Uninstall Service
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
  name: 'LauncherServiceControl',
  data() {
    return {
      serviceName: 'CasparCGLauncher',
      displayName: 'CasparCG Launcher',
      description: 'CasparCG Launcher Windows Service',
      status: 'unknown',
      statusMessage: '',
      isOperating: false,
    }
  },
  computed: {
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
    ipcRenderer.on('launcherService.status', this.handleStatusUpdate)
    if (this.isWindows) {
      this.refreshStatus()
    }
  },
  beforeDestroy() {
    ipcRenderer.removeListener('launcherService.status', this.handleStatusUpdate)
  },
  methods: {
    handleStatusUpdate(event, data) {
      try {
        const statusData = typeof data === 'string' ? JSON.parse(data) : data
        this.status = statusData.status
        this.statusMessage = statusData.message
        this.isOperating = ['installing', 'uninstalling'].includes(statusData.status)
      } catch (e) {
        console.error('Failed to parse status update:', e)
      }
    },
    sendCommand(cmd, param) {
      ipcRenderer.send('launcherService.control', cmd, param)
    },
    getServiceConfig() {
      return {
        serviceName: this.serviceName,
        displayName: this.displayName,
        description: this.description,
      }
    },
    refreshStatus() {
      this.sendCommand('status', this.getServiceConfig())
    },
    installService() {
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('install', this.getServiceConfig())
    },
    uninstallService() {
      this.isOperating = true
      this.statusMessage = ''
      this.sendCommand('configure', this.getServiceConfig())
      setTimeout(() => this.sendCommand('uninstall'), 100)
    },
  },
}
</script>
