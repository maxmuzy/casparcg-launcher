<template>
  <div>
    <b-form-group label="NDI Name">
      <b-form-input
        :value="config.name"
        @input="update('name', $event)"
        placeholder="Enter NDI stream name"
      />
    </b-form-group>
    <b-form-checkbox :checked="config.allowFields" @change="update('allowFields', $event)">
      Allow Fields (interlaced output)
    </b-form-checkbox>
  </div>
</template>

<script>
export default {
  name: 'NdiForm',
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
