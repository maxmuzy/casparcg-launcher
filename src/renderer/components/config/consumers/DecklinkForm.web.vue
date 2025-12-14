<template>
  <div>
    <b-row>
      <b-col md="4">
        <b-form-group label="Device">
          <b-form-input type="number" :value="config.device" @input="update('device', parseInt($event) || 1)" min="1" />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Key Device">
          <b-form-input
            type="number"
            :value="config.keyDevice"
            @input="update('keyDevice', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Buffer Depth">
          <b-form-input
            type="number"
            :value="config.bufferDepth"
            @input="update('bufferDepth', parseInt($event) || 3)"
            min="1"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="4">
        <b-form-group label="Latency">
          <b-form-select :value="config.latency" :options="latencyOptions" @change="update('latency', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Keyer">
          <b-form-select :value="config.keyer" :options="keyerOptions" @change="update('keyer', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Pixel Format">
          <b-form-select :value="config.pixelFormat" :options="pixelFormats" @change="update('pixelFormat', $event)" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="4">
        <b-form-checkbox :checked="config.embeddedAudio" @change="update('embeddedAudio', $event)">
          Embedded Audio
        </b-form-checkbox>
      </b-col>
      <b-col md="4">
        <b-form-checkbox :checked="config.keyOnly" @change="update('keyOnly', $event)">
          Key Only
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col md="6">
        <b-form-group label="Video Mode (Override)">
          <b-form-select :value="config.videoMode" :options="videoModes" @change="update('videoMode', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Color Space (Override)">
          <b-form-select :value="config.colorSpace" :options="colorSpaces" @change="update('colorSpace', $event)" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="Wait for Reference">
          <b-form-select
            :value="config.waitForReference"
            :options="waitForRefOptions"
            @change="update('waitForReference', $event)"
          />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Wait Duration (seconds)">
          <b-form-input
            type="number"
            :value="config.waitForReferenceDuration"
            @input="update('waitForReferenceDuration', parseInt($event) || 10)"
            min="1"
          />
        </b-form-group>
      </b-col>
    </b-row>

    <hr />
    <h6>Subregion (optional)</h6>
    <b-row>
      <b-col md="4">
        <b-form-group label="Src X">
          <b-form-input
            type="number"
            :value="subregion.srcX"
            @input="updateSubregion('srcX', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Src Y">
          <b-form-input
            type="number"
            :value="subregion.srcY"
            @input="updateSubregion('srcY', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Dest X">
          <b-form-input
            type="number"
            :value="subregion.destX"
            @input="updateSubregion('destX', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="4">
        <b-form-group label="Dest Y">
          <b-form-input
            type="number"
            :value="subregion.destY"
            @input="updateSubregion('destY', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Width">
          <b-form-input
            type="number"
            :value="subregion.width"
            @input="updateSubregion('width', parseInt($event) || 0)"
            min="0"
            placeholder="0 = no limit"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Height">
          <b-form-input
            type="number"
            :value="subregion.height"
            @input="updateSubregion('height', parseInt($event) || 0)"
            min="0"
            placeholder="0 = no limit"
          />
        </b-form-group>
      </b-col>
    </b-row>

    <hr />
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Secondary Ports</h6>
      <b-button size="sm" variant="outline-success" @click="addPort">
        Add Port
      </b-button>
    </div>
    <b-card v-for="(port, index) in ports" :key="index" class="mb-2" bg-variant="light">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Port {{ index + 1 }}</strong>
        <b-button size="sm" variant="outline-danger" @click="removePort(index)">
          <i class="fa fa-trash"></i>
        </b-button>
      </div>
      <b-row>
        <b-col md="4">
          <b-form-group label="Device" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="port.device"
              @input="updatePort(index, 'device', parseInt($event) || 1)"
              min="1"
            />
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group label="Video Mode" label-size="sm">
            <b-form-select
              size="sm"
              :value="port.videoMode"
              :options="videoModes"
              @change="updatePort(index, 'videoMode', $event)"
            />
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-checkbox
            :checked="port.keyOnly"
            @change="updatePort(index, 'keyOnly', $event)"
          >
            Key Only
          </b-form-checkbox>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="2">
          <b-form-group label="Src X" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).srcX"
              @input="updatePortSubregion(index, 'srcX', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
        <b-col md="2">
          <b-form-group label="Src Y" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).srcY"
              @input="updatePortSubregion(index, 'srcY', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
        <b-col md="2">
          <b-form-group label="Dest X" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).destX"
              @input="updatePortSubregion(index, 'destX', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
        <b-col md="2">
          <b-form-group label="Dest Y" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).destY"
              @input="updatePortSubregion(index, 'destY', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
        <b-col md="2">
          <b-form-group label="Width" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).width"
              @input="updatePortSubregion(index, 'width', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
        <b-col md="2">
          <b-form-group label="Height" label-size="sm">
            <b-form-input
              size="sm"
              type="number"
              :value="portSubregion(port).height"
              @input="updatePortSubregion(index, 'height', parseInt($event) || 0)"
              min="0"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-card>
    <p v-if="ports.length === 0" class="text-muted small">No secondary ports configured</p>
  </div>
</template>

<script>
import {
  LATENCY_OPTIONS,
  KEYER_OPTIONS,
  PIXEL_FORMAT_OPTIONS,
  VIDEO_MODES,
  COLOR_SPACE_OPTIONS,
} from '../../../utils/casparcgConfigParser'

export default {
  name: 'DecklinkForm',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      latencyOptions: LATENCY_OPTIONS.map((l) => ({ value: l, text: l })),
      keyerOptions: KEYER_OPTIONS.map((k) => ({ value: k, text: k })),
      pixelFormats: [{ value: '', text: 'Default' }, ...PIXEL_FORMAT_OPTIONS.map((p) => ({ value: p, text: p }))],
      videoModes: [{ value: '', text: 'Use Channel Mode' }, ...VIDEO_MODES.map((m) => ({ value: m, text: m }))],
      colorSpaces: [{ value: '', text: 'Default' }, ...COLOR_SPACE_OPTIONS.map((c) => ({ value: c, text: c }))],
      waitForRefOptions: ['auto', 'enable', 'disable'].map((w) => ({ value: w, text: w })),
    }
  },
  computed: {
    subregion() {
      return this.config.subregion || { srcX: 0, srcY: 0, destX: 0, destY: 0, width: 0, height: 0 }
    },
    ports() {
      return this.config.ports || []
    },
  },
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
    updateSubregion(field, value) {
      const subregion = { ...this.subregion, [field]: value }
      const hasValues = Object.values(subregion).some((v) => v !== 0)
      this.$emit('update', { subregion: hasValues ? subregion : null })
    },
    portSubregion(port) {
      return port.subregion || { srcX: 0, srcY: 0, destX: 0, destY: 0, width: 0, height: 0 }
    },
    addPort() {
      const ports = [...this.ports, { device: 1, keyOnly: false, videoMode: '', subregion: null }]
      this.$emit('update', { ports })
    },
    removePort(index) {
      const ports = this.ports.filter((_, i) => i !== index)
      this.$emit('update', { ports })
    },
    updatePort(index, field, value) {
      const ports = [...this.ports]
      ports[index] = { ...ports[index], [field]: value }
      this.$emit('update', { ports })
    },
    updatePortSubregion(index, field, value) {
      const ports = [...this.ports]
      const subregion = { ...this.portSubregion(ports[index]), [field]: value }
      const hasValues = Object.values(subregion).some((v) => v !== 0)
      ports[index] = { ...ports[index], subregion: hasValues ? subregion : null }
      this.$emit('update', { ports })
    },
  },
}
</script>
