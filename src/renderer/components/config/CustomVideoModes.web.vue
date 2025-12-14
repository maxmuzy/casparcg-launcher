<template>
  <b-card header="Custom Video Modes" class="mb-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <p class="mb-0 text-muted small">
        Define custom video modes with specific dimensions and timing
      </p>
      <b-button size="sm" variant="outline-success" @click="addMode">
        Add Video Mode
      </b-button>
    </div>
    <b-table v-if="customVideoModes.length > 0" :items="customVideoModes" :fields="fields" small striped>
      <template #cell(id)="row">
        <b-form-input
          size="sm"
          :value="row.item.id"
          @input="updateMode(row.index, 'id', $event)"
          placeholder="e.g. 1024x768p60"
        />
      </template>
      <template #cell(width)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.width"
          @input="updateMode(row.index, 'width', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(height)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.height"
          @input="updateMode(row.index, 'height', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(timeScale)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.timeScale"
          @input="updateMode(row.index, 'timeScale', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(duration)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.duration"
          @input="updateMode(row.index, 'duration', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(cadence)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.cadence"
          @input="updateMode(row.index, 'cadence', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-danger" @click="removeCustomVideoMode(row.index)">
          <i class="fa fa-trash"></i>
        </b-button>
      </template>
    </b-table>
    <p v-else class="text-muted small">No custom video modes defined</p>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CustomVideoModes',
  data() {
    return {
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'width', label: 'Width' },
        { key: 'height', label: 'Height' },
        { key: 'timeScale', label: 'Time Scale' },
        { key: 'duration', label: 'Duration' },
        { key: 'cadence', label: 'Cadence' },
        { key: 'actions', label: '' },
      ],
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['customVideoModes']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['addCustomVideoMode', 'removeCustomVideoMode', 'updateCustomVideoMode']),
    addMode() {
      this.addCustomVideoMode({
        id: '',
        width: 1920,
        height: 1080,
        timeScale: 60000,
        duration: 1000,
        cadence: 800,
      })
    },
    updateMode(index, field, value) {
      const mode = { ...this.customVideoModes[index], [field]: value }
      this.updateCustomVideoMode({ index, mode })
    },
  },
}
</script>
