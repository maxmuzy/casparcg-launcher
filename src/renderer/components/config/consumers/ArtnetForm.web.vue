<template>
  <div>
    <b-row>
      <b-col md="3">
        <b-form-group label="Universe">
          <b-form-input
            type="number"
            :value="config.universe"
            @input="update('universe', parseInt($event) || 0)"
            min="0"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Host">
          <b-form-input
            :value="config.host"
            @input="update('host', $event)"
            placeholder="127.0.0.1"
          />
        </b-form-group>
      </b-col>
      <b-col md="2">
        <b-form-group label="Port">
          <b-form-input
            type="number"
            :value="config.port"
            @input="update('port', parseInt($event) || 6454)"
            min="1"
          />
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Refresh Rate">
          <b-form-input
            type="number"
            :value="config.refreshRate"
            @input="update('refreshRate', parseInt($event) || 30)"
            min="1"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <hr />
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Fixtures</h6>
      <b-button size="sm" variant="outline-success" @click="addFixture">
        Add Fixture
      </b-button>
    </div>
    <b-table
      v-if="localFixtures.length > 0"
      :items="localFixtures"
      :fields="fixtureFields"
      small
      striped
    >
      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-danger" @click="removeFixture(row.index)">
          <i class="fa fa-trash"></i>
        </b-button>
      </template>
      <template #cell(type)="row">
        <b-form-select
          size="sm"
          :value="row.item.type"
          :options="fixtureTypes"
          @change="updateFixture(row.index, 'type', $event)"
        />
      </template>
      <template #cell(startAddress)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.startAddress"
          @input="updateFixture(row.index, 'startAddress', parseInt($event) || 1)"
        />
      </template>
      <template #cell(fixtureCount)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.fixtureCount"
          @input="updateFixture(row.index, 'fixtureCount', parseInt($event) || 1)"
        />
      </template>
    </b-table>
    <p v-else class="text-muted small">No fixtures configured</p>
  </div>
</template>

<script>
export default {
  name: 'ArtnetForm',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localFixtures: [],
      fixtureFields: [
        { key: 'type', label: 'Type' },
        { key: 'startAddress', label: 'Start Addr' },
        { key: 'fixtureCount', label: 'Count' },
        { key: 'actions', label: '' },
      ],
      fixtureTypes: ['RGBW', 'RGB', 'DIMMER'].map((t) => ({ value: t, text: t })),
    }
  },
  watch: {
    config: {
      immediate: true,
      handler(val) {
        this.localFixtures = val.fixtures ? JSON.parse(JSON.stringify(val.fixtures)) : []
      },
    },
  },
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
    addFixture() {
      this.localFixtures.push({
        type: 'RGBW',
        startAddress: 1,
        fixtureCount: 1,
        fixtureChannels: 6,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      })
      this.update('fixtures', this.localFixtures)
    },
    removeFixture(index) {
      this.localFixtures.splice(index, 1)
      this.update('fixtures', this.localFixtures)
    },
    updateFixture(index, field, value) {
      this.localFixtures[index][field] = value
      this.update('fixtures', [...this.localFixtures])
    },
  },
}
</script>
