<template>
  <b-card header="Paths Configuration" class="mb-3">
    <b-form-group label="Media Path" label-cols-sm="3">
      <b-form-input
        :value="paths.mediaPath"
        @input="updatePath('mediaPath', $event)"
        placeholder="media/"
      />
    </b-form-group>
    <b-form-group label="Log Path" label-cols-sm="3">
      <b-input-group>
        <b-form-input
          :value="paths.logPath"
          @input="updatePath('logPath', $event)"
          placeholder="log/"
        />
        <b-input-group-append>
          <b-form-checkbox
            :checked="paths.logPathDisable"
            @change="updatePath('logPathDisable', $event)"
            button
            button-variant="outline-warning"
          >
            Disable
          </b-form-checkbox>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <b-form-group label="Data Path" label-cols-sm="3">
      <b-form-input
        :value="paths.dataPath"
        @input="updatePath('dataPath', $event)"
        placeholder="data/"
      />
    </b-form-group>
    <b-form-group label="Template Path" label-cols-sm="3">
      <b-form-input
        :value="paths.templatePath"
        @input="updatePath('templatePath', $event)"
        placeholder="template/"
      />
    </b-form-group>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PathsConfiguration',
  computed: {
    ...mapGetters('CasparcgConfig', ['paths']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['updateConfig']),
    updatePath(field, value) {
      this.updateConfig({ path: `paths.${field}`, value })
    },
  },
}
</script>
