<template>
  <div id="process-controls">
    <span>
      {{ data.status }}
    </span>
    <b-button-group>
      <b-button v-if="showClear" variant="warning" @click="clearLog">
        Clear Log
      </b-button>
      <b-button variant="success" v-on:click="start">
        Start
      </b-button>
      <b-button variant="danger" v-on:click="stop">
        Stop
      </b-button>
      <b-button variant="info" v-on:click="restart">
        Restart
      </b-button>
      <b-button v-if="isCasparCG" variant="secondary" v-on:click="openConfig" title="CasparCG Configuration">
        <i class="fa fa-cog"></i>
      </b-button>
    </b-button-group>

    <CasparCGConfigModal v-model="showConfigModal" :process-id="id" />
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import CasparCGConfigModal from './CasparCGConfigModal.vue'

export default {
  components: {
    CasparCGConfigModal,
  },
  props: ['id', 'showClear'],
  data() {
    return {
      data: this.$store.state.Process[this.id] || {},
      showConfigModal: false,
      processConfig: null,
    }
  },
  computed: {
    isCasparCG() {
      if (!this.processConfig) return false
      const exeName = (this.processConfig.exeName || '').toLowerCase()
      return exeName.includes('casparcg') || this.id === 'casparcg'
    },
  },
  created() {
    this.$store.dispatch('init', { id: this.id })
    this.loadProcessConfig()
  },
  methods: {
    loadProcessConfig() {
      ipcRenderer.once('config', (event, config) => {
        if (config && config.processes) {
          this.processConfig = config.processes.find((p) => p.id === this.id) || null
        }
      })
      ipcRenderer.send('config.get')
    },
    clearLog() {
      this.$store.dispatch('logClear', { id: this.id })
    },
    stop() {
      ipcRenderer.send(this.id + '.control', 'stop')
    },
    start() {
      ipcRenderer.send(this.id + '.control', 'start')
    },
    restart() {
      ipcRenderer.send(this.id + '.control', 'restart')
    },
    openConfig() {
      this.showConfigModal = true
    },
  },
}
</script>

<style scoped>
#process-controls {
  text-align: right;
}
.btn-group {
  margin: 15px;
}
</style>
