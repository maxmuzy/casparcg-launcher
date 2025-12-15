<template>
  <b-modal
    v-model="showModal"
    title="CasparCG Configuration"
    size="xl"
    scrollable
    no-close-on-backdrop
    @hidden="onHidden"
  >
    <template #modal-header>
      <div class="d-flex justify-content-between align-items-center w-100">
        <h5 class="mb-0">CasparCG Configuration</h5>
        <div>
          <b-badge v-if="isDirty" variant="warning" class="mr-2">Unsaved Changes</b-badge>
          <small class="text-muted">{{ configPath }}</small>
        </div>
      </div>
    </template>

    <b-alert v-if="error" variant="danger" show dismissible @dismissed="error = null">
      {{ error }}
    </b-alert>

    <b-alert v-if="!configPath" variant="info" show>
      Configure the base path in Settings to enable configuration editing.
    </b-alert>

    <div v-if="isLoading" class="text-center py-4">
      <b-spinner></b-spinner>
      <p>Loading configuration...</p>
    </div>

    <template v-else>
      <div class="mb-3">
        <b-button variant="outline-secondary" size="sm" class="mr-2" @click="loadFromFile">
          <i class="fa fa-folder-open"></i> Load from File
        </b-button>
        <b-button variant="outline-primary" size="sm" class="mr-2" @click="showExport">
          <i class="fa fa-download"></i> Export XML
        </b-button>
        <b-button variant="outline-danger" size="sm" @click="resetToDefault">
          <i class="fa fa-refresh"></i> Reset to Default
        </b-button>
      </div>

      <b-tabs content-class="mt-3" nav-class="nav-tabs-config">
        <b-tab title="Paths" active>
          <paths-configuration />
        </b-tab>
        <b-tab title="Channels">
          <channels-configuration />
        </b-tab>
        <b-tab title="Audio">
          <audio-configuration />
        </b-tab>
        <b-tab title="Controllers">
          <controllers-configuration />
        </b-tab>
        <b-tab title="OSC">
          <osc-configuration />
        </b-tab>
        <b-tab title="Video Modes">
          <custom-video-modes />
        </b-tab>
        <b-tab title="Templates">
          <template-hosts />
        </b-tab>
        <b-tab title="Advanced">
          <advanced-settings />
        </b-tab>
      </b-tabs>
    </template>

    <template #modal-footer>
      <b-button variant="secondary" @click="cancel">
        Cancel
      </b-button>
      <b-button variant="primary" :disabled="!isDirty" @click="applyConfig">
        Apply & Restart CasparCG
      </b-button>
    </template>

    <b-modal v-model="showImportModal" title="Import Configuration" @ok="handleImport">
      <b-form-group label="Paste casparcg.config XML content:">
        <b-form-textarea
          v-model="xmlInput"
          rows="10"
          placeholder="<?xml version='1.0' encoding='utf-8'?>
<configuration>
  ...
</configuration>"
        />
      </b-form-group>
    </b-modal>

    <b-modal v-model="showExportModal" title="Export Configuration" size="lg" ok-only ok-title="Close">
      <b-form-group label="Generated casparcg.config XML:">
        <b-form-textarea v-model="xmlOutput" rows="15" readonly />
      </b-form-group>
      <b-button variant="primary" size="sm" @click="copyToClipboard">
        <i class="fa fa-copy"></i> Copy to Clipboard
      </b-button>
    </b-modal>

    <b-modal
      v-model="showRestartConfirm"
      title="Restart Required"
      ok-variant="warning"
      ok-title="Save & Restart"
      cancel-title="Cancel"
      @ok="confirmRestart"
    >
      <p>The configuration has been saved. CasparCG needs to be restarted for the changes to take effect.</p>
      <p><strong>Do you want to restart CasparCG now?</strong></p>
    </b-modal>
  </b-modal>
</template>

<script>
const { ipcRenderer } = require('electron')
import { mapGetters, mapActions } from 'vuex'
import { parseXmlToConfig, configToXml } from '../utils/casparcgConfigParser'
import PathsConfiguration from './config/PathsConfiguration.vue'
import ChannelsConfiguration from './config/ChannelsConfiguration.vue'
import ControllersConfiguration from './config/ControllersConfiguration.vue'
import OscConfiguration from './config/OSCConfiguration.vue'
import AdvancedSettings from './config/AdvancedSettings.vue'
import AudioConfiguration from './config/AudioConfiguration.vue'
import CustomVideoModes from './config/CustomVideoModes.vue'
import TemplateHosts from './config/TemplateHosts.vue'

export default {
  name: 'CasparCGConfigModal',
  components: {
    PathsConfiguration,
    ChannelsConfiguration,
    ControllersConfiguration,
    OscConfiguration,
    AdvancedSettings,
    AudioConfiguration,
    CustomVideoModes,
    TemplateHosts,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    processId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      error: null,
      configPath: '',
      showImportModal: false,
      showExportModal: false,
      showRestartConfirm: false,
      xmlInput: '',
      xmlOutput: '',
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['config', 'isDirty']),
    showModal: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.loadConfig()
      }
    },
  },
  methods: {
    ...mapActions('CasparcgConfig', ['setConfig', 'resetConfig', 'setError']),
    async loadConfig() {
      this.isLoading = true
      this.error = null

      ipcRenderer.once('casparcg.config.path', (event, pathResult) => {
        this.configPath = pathResult || ''
      })
      ipcRenderer.send('casparcg.config.path')

      ipcRenderer.once('casparcg.config.get', async (event, content) => {
        this.isLoading = false
        if (content) {
          try {
            const config = await parseXmlToConfig(content)
            this.setConfig(config)
          } catch (err) {
            this.error = 'Failed to parse configuration: ' + err.message
            this.resetConfig()
          }
        } else {
          this.resetConfig()
        }
      })
      ipcRenderer.send('casparcg.config.get')
    },
    loadFromFile() {
      this.xmlInput = ''
      this.showImportModal = true
    },
    async handleImport() {
      try {
        const config = await parseXmlToConfig(this.xmlInput)
        this.setConfig(config)
        this.showImportModal = false
      } catch (err) {
        this.error = 'Failed to parse XML: ' + err.message
      }
    },
    showExport() {
      try {
        this.xmlOutput = configToXml(this.config)
        this.showExportModal = true
      } catch (err) {
        this.error = 'Failed to generate XML: ' + err.message
      }
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.xmlOutput).then(() => {
        this.$bvToast.toast('Configuration copied to clipboard!', {
          title: 'Success',
          variant: 'success',
          solid: true,
          autoHideDelay: 2000,
        })
      })
    },
    resetToDefault() {
      this.resetConfig()
    },
    cancel() {
      if (this.isDirty) {
        this.$bvModal
          .msgBoxConfirm('You have unsaved changes. Are you sure you want to close?', {
            title: 'Unsaved Changes',
            okVariant: 'danger',
            okTitle: 'Discard Changes',
            cancelTitle: 'Keep Editing',
          })
          .then((confirmed) => {
            if (confirmed) {
              this.showModal = false
            }
          })
      } else {
        this.showModal = false
      }
    },
    applyConfig() {
      try {
        const xmlContent = configToXml(this.config)

        ipcRenderer.once('casparcg.config.set', (event, result) => {
          if (result && result.success) {
            this.showRestartConfirm = true
          } else {
            this.error = 'Failed to save configuration: ' + (result ? result.error : 'Unknown error')
          }
        })
        ipcRenderer.send('casparcg.config.set', xmlContent)
      } catch (err) {
        this.error = 'Failed to generate configuration: ' + err.message
      }
    },
    confirmRestart() {
      ipcRenderer.send(this.processId + '.control', 'restart')
      this.showRestartConfirm = false
      this.showModal = false
      this.$bvToast.toast('CasparCG is restarting with the new configuration.', {
        title: 'Restarting',
        variant: 'info',
        solid: true,
        autoHideDelay: 3000,
      })
    },
    onHidden() {
      this.$emit('input', false)
    },
  },
}
</script>

<style scoped>
.modal-xl {
  max-width: 90%;
}
</style>
