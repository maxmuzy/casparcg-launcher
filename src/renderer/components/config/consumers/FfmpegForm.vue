<template>
  <div>
    <b-form-group label="Output Path">
      <b-form-input
        :value="config.path"
        @input="update('path', $event)"
        placeholder="e.g., udp://127.0.0.1:5000 or output.mp4"
      />
      <b-form-text>URL for streaming or file path for recording</b-form-text>
    </b-form-group>
    <b-form-group label="FFmpeg Arguments">
      <b-form-textarea
        :value="config.args"
        @input="update('args', $event)"
        placeholder="-vcodec libx264 -tune zerolatency -preset ultrafast"
        rows="3"
      />
      <b-form-text>Additional FFmpeg encoding arguments</b-form-text>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: 'FfmpegForm',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
  },
}
</script>
