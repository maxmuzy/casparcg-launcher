<template>
  <b-card header="Audio Configuration" class="mb-3">
    <b-tabs content-class="mt-3">
      <b-tab title="Channel Layouts" active>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Custom Channel Layouts</h6>
          <b-button size="sm" variant="outline-success" @click="addLayout">
            Add Layout
          </b-button>
        </div>
        <b-table
          v-if="audio.channelLayouts.length > 0"
          :items="audio.channelLayouts"
          :fields="layoutFields"
          small
          striped
        >
          <template #cell(name)="row">
            <b-form-input
              size="sm"
              :value="row.item.name"
              @input="updateLayout(row.index, 'name', $event)"
              placeholder="e.g. 8ch"
            />
          </template>
          <template #cell(type)="row">
            <b-form-input
              size="sm"
              :value="row.item.type"
              @input="updateLayout(row.index, 'type', $event)"
              placeholder="e.g. 8.0"
            />
          </template>
          <template #cell(numChannels)="row">
            <b-form-input
              size="sm"
              type="number"
              :value="row.item.numChannels"
              @input="updateLayout(row.index, 'numChannels', parseInt($event) || 0)"
              min="1"
              max="32"
            />
          </template>
          <template #cell(channels)="row">
            <b-form-input
              size="sm"
              :value="row.item.channels"
              @input="updateLayout(row.index, 'channels', $event)"
              placeholder="L R C LFE Ls Rs"
            />
          </template>
          <template #cell(actions)="row">
            <b-button size="sm" variant="outline-danger" @click="removeChannelLayout(row.index)">
              <i class="fa fa-trash"></i>
            </b-button>
          </template>
        </b-table>
        <p v-else class="text-muted small">No custom channel layouts defined</p>
      </b-tab>

      <b-tab title="Mix Configs">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Audio Mix Configurations</h6>
          <b-button size="sm" variant="outline-success" @click="addMix">
            Add Mix Config
          </b-button>
        </div>
        <b-card
          v-for="(mix, index) in audio.mixConfigs"
          :key="index"
          class="mb-2"
          bg-variant="light"
        >
          <b-row>
            <b-col md="3">
              <b-form-group label="From" label-cols-sm="4" label-size="sm">
                <b-form-input
                  size="sm"
                  :value="mix.from"
                  @input="updateMix(index, 'from', $event)"
                  placeholder="e.g. 8.0"
                />
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="To" label-cols-sm="4" label-size="sm">
                <b-form-input
                  size="sm"
                  :value="mix.to"
                  @input="updateMix(index, 'to', $event)"
                  placeholder="e.g. 8.0"
                />
              </b-form-group>
            </b-col>
            <b-col md="3">
              <b-form-group label="Mix" label-cols-sm="4" label-size="sm">
                <b-form-select
                  size="sm"
                  :value="mix.mix"
                  @change="updateMix(index, 'mix', $event)"
                  :options="['add', 'average']"
                />
              </b-form-group>
            </b-col>
            <b-col md="3" class="text-right">
              <b-button size="sm" variant="outline-danger" @click="removeMixConfig(index)">
                <i class="fa fa-trash"></i> Remove
              </b-button>
            </b-col>
          </b-row>
          <hr />
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong class="small">Mappings</strong>
            <b-button size="sm" variant="outline-primary" @click="addMapping(index)">
              Add Mapping
            </b-button>
          </div>
          <b-list-group v-if="mix.mappings && mix.mappings.length > 0">
            <b-list-group-item
              v-for="(mapping, mIndex) in mix.mappings"
              :key="mIndex"
              class="d-flex justify-content-between align-items-center py-1"
            >
              <b-form-input
                size="sm"
                :value="mapping"
                @input="updateMapping(index, mIndex, $event)"
                placeholder="L L 1.0"
                style="max-width: 250px"
              />
              <b-button size="sm" variant="outline-danger" @click="removeMapping(index, mIndex)">
                <i class="fa fa-times"></i>
              </b-button>
            </b-list-group-item>
          </b-list-group>
          <p v-else class="text-muted small mb-0">No mappings defined</p>
        </b-card>
        <p v-if="audio.mixConfigs.length === 0" class="text-muted small">
          No mix configurations defined
        </p>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AudioConfiguration',
  data() {
    return {
      layoutFields: [
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'numChannels', label: 'Channels' },
        { key: 'channels', label: 'Channel Names' },
        { key: 'actions', label: '' },
      ],
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['audio']),
  },
  methods: {
    ...mapActions('CasparcgConfig', [
      'addChannelLayout',
      'removeChannelLayout',
      'updateChannelLayout',
      'addMixConfig',
      'removeMixConfig',
      'updateMixConfig',
    ]),
    addLayout() {
      this.addChannelLayout({
        name: '',
        type: '',
        numChannels: 2,
        channels: '',
      })
    },
    updateLayout(index, field, value) {
      const layout = { ...this.audio.channelLayouts[index], [field]: value }
      this.updateChannelLayout({ index, layout })
    },
    addMix() {
      this.addMixConfig({
        from: '',
        to: '',
        mix: 'add',
        mappings: [],
      })
    },
    updateMix(index, field, value) {
      const mixConfig = { ...this.audio.mixConfigs[index], [field]: value }
      this.updateMixConfig({ index, mixConfig })
    },
    addMapping(mixIndex) {
      const mix = this.audio.mixConfigs[mixIndex]
      const mappings = [...(mix.mappings || []), '']
      this.updateMix(mixIndex, 'mappings', mappings)
    },
    updateMapping(mixIndex, mappingIndex, value) {
      const mix = this.audio.mixConfigs[mixIndex]
      const mappings = [...mix.mappings]
      mappings[mappingIndex] = value
      this.updateMix(mixIndex, 'mappings', mappings)
    },
    removeMapping(mixIndex, mappingIndex) {
      const mix = this.audio.mixConfigs[mixIndex]
      const mappings = mix.mappings.filter((_, i) => i !== mappingIndex)
      this.updateMix(mixIndex, 'mappings', mappings)
    },
  },
}
</script>
