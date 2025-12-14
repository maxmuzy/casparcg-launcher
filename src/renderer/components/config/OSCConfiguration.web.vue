<template>
  <b-card header="OSC Configuration" class="mb-3">
    <b-row>
      <b-col md="6">
        <b-form-group label="Default Port" label-cols-sm="4">
          <b-form-input
            type="number"
            :value="osc.defaultPort"
            @input="updateOsc('defaultPort', parseInt($event) || 6250)"
            min="1"
            max="65535"
          />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-checkbox
          :checked="osc.disableSendToAmcpClients"
          @change="updateOsc('disableSendToAmcpClients', $event)"
        >
          Disable Send to AMCP Clients
        </b-form-checkbox>
      </b-col>
    </b-row>
    <hr />
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Predefined Clients</h6>
      <b-button size="sm" variant="outline-success" @click="addOscClient">
        Add Client
      </b-button>
    </div>
    <b-table
      v-if="osc.predefinedClients.length > 0"
      :items="osc.predefinedClients"
      :fields="clientFields"
      small
      striped
    >
      <template #cell(address)="row">
        <b-form-input
          size="sm"
          :value="row.item.address"
          @input="updateClient(row.index, 'address', $event)"
          placeholder="127.0.0.1"
        />
      </template>
      <template #cell(port)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.port"
          @input="updateClient(row.index, 'port', parseInt($event) || 5253)"
        />
      </template>
      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-danger" @click="removeOscClient(row.index)">
          <i class="fa fa-trash"></i>
        </b-button>
      </template>
    </b-table>
    <p v-else class="text-muted small">No predefined OSC clients</p>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'OSCConfiguration',
  data() {
    return {
      clientFields: [
        { key: 'address', label: 'Address' },
        { key: 'port', label: 'Port' },
        { key: 'actions', label: '' },
      ],
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['osc']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['updateConfig', 'addOscClient', 'removeOscClient', 'updateOscClient']),
    updateOsc(field, value) {
      this.updateConfig({ path: `osc.${field}`, value })
    },
    updateClient(index, field, value) {
      const client = { ...this.osc.predefinedClients[index], [field]: value }
      this.updateOscClient({ index, client })
    },
  },
}
</script>
