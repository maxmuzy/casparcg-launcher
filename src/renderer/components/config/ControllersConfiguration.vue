<template>
  <b-card header="Controllers & AMCP" class="mb-3">
    <b-row>
      <b-col md="6">
        <h6>TCP Controller</h6>
        <b-form-group label="Port" label-cols-sm="4">
          <b-form-input
            type="number"
            :value="controllers.tcp.port"
            @input="updateController('port', parseInt($event) || 5250)"
            min="1"
            max="65535"
          />
        </b-form-group>
        <b-form-group label="Protocol" label-cols-sm="4">
          <b-form-select
            :value="controllers.tcp.protocol"
            :options="protocols"
            @change="updateController('protocol', $event)"
          />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <h6>AMCP Media Server</h6>
        <b-form-group label="Host" label-cols-sm="4">
          <b-form-input
            :value="config.amcp.mediaServer.host"
            @input="updateAmcp('host', $event)"
            placeholder="localhost"
          />
        </b-form-group>
        <b-form-group label="Port" label-cols-sm="4">
          <b-form-input
            type="number"
            :value="config.amcp.mediaServer.port"
            @input="updateAmcp('port', parseInt($event) || 8000)"
            min="1"
            max="65535"
          />
        </b-form-group>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ControllersConfiguration',
  data() {
    return {
      protocols: ['AMCP', 'LOG'].map((p) => ({ value: p, text: p })),
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['controllers', 'config']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['updateConfig']),
    updateController(field, value) {
      this.updateConfig({ path: `controllers.tcp.${field}`, value })
    },
    updateAmcp(field, value) {
      this.updateConfig({ path: `amcp.mediaServer.${field}`, value })
    },
  },
}
</script>
