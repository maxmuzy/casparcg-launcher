<template>
  <div class="casparcg-config">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>CasparCG Configuration Editor</h4>
      <div>
        <b-badge v-if="isDirty" variant="warning" class="mr-2">Unsaved Changes</b-badge>
        <b-button variant="outline-secondary" size="sm" class="mr-2" @click="loadConfig">
          <i class="fa fa-folder-open"></i> Load
        </b-button>
        <b-button variant="outline-primary" size="sm" class="mr-2" @click="exportConfig">
          <i class="fa fa-download"></i> Export XML
        </b-button>
        <b-button variant="outline-danger" size="sm" @click="resetConfig">
          <i class="fa fa-refresh"></i> Reset
        </b-button>
      </div>
    </div>

    <b-alert v-if="error" variant="danger" show dismissible @dismissed="clearError">
      {{ error }}
    </b-alert>

    <b-tabs content-class="mt-3" nav-class="nav-tabs-config">
      <b-tab title="Paths" active>
        <paths-configuration />
      </b-tab>
      <b-tab title="Channels">
        <channels-configuration />
      </b-tab>
      <b-tab title="Controllers">
        <controllers-configuration />
      </b-tab>
      <b-tab title="OSC">
        <osc-configuration />
      </b-tab>
      <b-tab title="Advanced">
        <advanced-settings />
      </b-tab>
    </b-tabs>

    <b-modal v-model="showLoadModal" title="Load Configuration" @ok="handleLoad">
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { parseXmlToConfig, configToXml } from '../../utils/casparcgConfigParser'
import PathsConfiguration from './PathsConfiguration.web.vue'
import ChannelsConfiguration from './ChannelsConfiguration.web.vue'
import ControllersConfiguration from './ControllersConfiguration.web.vue'
import OscConfiguration from './OSCConfiguration.web.vue'
import AdvancedSettings from './AdvancedSettings.web.vue'

export default {
  name: 'CasparCGConfig',
  components: {
    PathsConfiguration,
    ChannelsConfiguration,
    ControllersConfiguration,
    OscConfiguration,
    AdvancedSettings,
  },
  data() {
    return {
      showLoadModal: false,
      showExportModal: false,
      xmlInput: '',
      xmlOutput: '',
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['config', 'isDirty', 'error']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['setConfig', 'setError', 'resetConfig']),
    loadConfig() {
      this.xmlInput = ''
      this.showLoadModal = true
    },
    async handleLoad() {
      try {
        const config = await parseXmlToConfig(this.xmlInput)
        this.setConfig(config)
        this.showLoadModal = false
      } catch (err) {
        this.setError('Failed to parse XML: ' + err.message)
      }
    },
    exportConfig() {
      try {
        this.xmlOutput = configToXml(this.config)
        this.showExportModal = true
      } catch (err) {
        this.setError('Failed to generate XML: ' + err.message)
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
    clearError() {
      this.setError(null)
    },
  },
}
</script>

<style scoped>
.casparcg-config {
  padding: 20px;
}
</style>
