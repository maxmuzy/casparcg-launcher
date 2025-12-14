<template>
  <b-card header="Template Hosts" class="mb-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <p class="mb-0 text-muted small">
        Configure HTML template host settings for different video modes
      </p>
      <b-button size="sm" variant="outline-success" @click="addHost">
        Add Template Host
      </b-button>
    </div>
    <b-table
      v-if="templateHosts.length > 0"
      :items="templateHosts"
      :fields="fields"
      small
      striped
    >
      <template #cell(videoMode)="row">
        <b-form-select
          size="sm"
          :value="row.item.videoMode"
          @change="updateHost(row.index, 'videoMode', $event)"
          :options="videoModeOptions"
        />
      </template>
      <template #cell(filename)="row">
        <b-form-input
          size="sm"
          :value="row.item.filename"
          @input="updateHost(row.index, 'filename', $event)"
          placeholder="template.html"
        />
      </template>
      <template #cell(width)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.width"
          @input="updateHost(row.index, 'width', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(height)="row">
        <b-form-input
          size="sm"
          type="number"
          :value="row.item.height"
          @input="updateHost(row.index, 'height', parseInt($event) || 0)"
          min="1"
        />
      </template>
      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-danger" @click="removeTemplateHost(row.index)">
          <i class="fa fa-trash"></i>
        </b-button>
      </template>
    </b-table>
    <p v-else class="text-muted small">No template hosts defined</p>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { VIDEO_MODES } from '../../utils/casparcgConfigParser'

export default {
  name: 'TemplateHosts',
  data() {
    return {
      fields: [
        { key: 'videoMode', label: 'Video Mode' },
        { key: 'filename', label: 'Filename' },
        { key: 'width', label: 'Width' },
        { key: 'height', label: 'Height' },
        { key: 'actions', label: '' },
      ],
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['templateHosts']),
    videoModeOptions() {
      return ['', ...VIDEO_MODES]
    },
  },
  methods: {
    ...mapActions('CasparcgConfig', [
      'addTemplateHost',
      'removeTemplateHost',
      'updateTemplateHost',
    ]),
    addHost() {
      this.addTemplateHost({
        videoMode: '',
        filename: '',
        width: 1920,
        height: 1080,
      })
    },
    updateHost(index, field, value) {
      const host = { ...this.templateHosts[index], [field]: value }
      this.updateTemplateHost({ index, host })
    },
  },
}
</script>
