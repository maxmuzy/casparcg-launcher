<template>
  <div>
    <b-form-group label="Channel Layout" label-cols-sm="4">
      <b-form-select
        :value="localConfig.channelLayout"
        @change="update('channelLayout', $event)"
        :options="channelLayoutOptions"
      />
    </b-form-group>
    <b-form-group label="Latency (ms)" label-cols-sm="4">
      <b-form-input
        type="number"
        :value="localConfig.latency"
        @input="update('latency', parseInt($event) || 200)"
        min="0"
        max="10000"
      />
    </b-form-group>
  </div>
</template>

<script>
import { CHANNEL_LAYOUT_OPTIONS } from '../../../utils/casparcgConfigParser'

export default {
  name: 'SystemAudioForm',
  props: {
    config: {
      type: Object,
      default: () => ({ channelLayout: 'stereo', latency: 200 }),
    },
  },
  computed: {
    localConfig() {
      return {
        channelLayout: this.config.channelLayout || 'stereo',
        latency: this.config.latency || 200,
      }
    },
    channelLayoutOptions() {
      return CHANNEL_LAYOUT_OPTIONS
    },
  },
  methods: {
    update(field, value) {
      const newConfig = { ...this.localConfig, [field]: value }
      this.$emit('update', newConfig)
    },
  },
}
</script>
