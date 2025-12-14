<template>
  <div>
    <b-row>
      <b-col md="4">
        <b-form-group label="Device">
          <b-form-input
            type="number"
            :value="config.device"
            @input="update('device', parseInt($event) || 1)"
            min="1"
          />
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
          <b-form-select
            :value="config.latency"
            :options="latencyOptions"
            @change="update('latency', $event)"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Keyer">
          <b-form-select
            :value="config.keyer"
            :options="keyerOptions"
            @change="update('keyer', $event)"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Pixel Format">
          <b-form-select
            :value="config.pixelFormat"
            :options="pixelFormats"
            @change="update('pixelFormat', $event)"
          />
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
          <b-form-select
            :value="config.videoMode"
            :options="videoModes"
            @change="update('videoMode', $event)"
          />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Color Space (Override)">
          <b-form-select
            :value="config.colorSpace"
            :options="colorSpaces"
            @change="update('colorSpace', $event)"
          />
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
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
  },
}
</script>
