<template>
  <b-card header="Channels Configuration" class="mb-3">
    <div class="d-flex justify-content-end mb-3">
      <b-button variant="success" size="sm" @click="addChannel"> <i class="fa fa-plus"></i> Add Channel </b-button>
    </div>
    <b-card v-for="(channel, index) in channels" :key="index" class="mb-3" :header="`Channel ${index + 1}`">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <span>Channel {{ index + 1 }}</span>
          <b-button variant="danger" size="sm" @click="removeChannel(index)" :disabled="channels.length <= 1">
            <i class="fa fa-trash"></i>
          </b-button>
        </div>
      </template>
      <b-row>
        <b-col md="4">
          <b-form-group label="Video Mode">
            <b-form-select
              :value="channel.videoMode"
              :options="videoModes"
              @change="updateChannelField(index, 'videoMode', $event)"
            />
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group label="Color Depth">
            <b-form-select
              :value="channel.colorDepth"
              :options="colorDepths"
              @change="updateChannelField(index, 'colorDepth', $event)"
            />
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group label="Color Space">
            <b-form-select
              :value="channel.colorSpace"
              :options="colorSpaces"
              @change="updateChannelField(index, 'colorSpace', $event)"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <consumers-configuration :channel-index="index" :consumers="channel.consumers" />
      <b-card header="Producers" class="mt-3">
        <div class="d-flex justify-content-end mb-2">
          <b-button variant="success" size="sm" @click="handleAddProducer(index)">
            <i class="fa fa-plus"></i> Add Producer
          </b-button>
        </div>
        <div v-if="!channel.producers || channel.producers.length === 0" class="text-muted text-center py-2">
          No producers configured
        </div>
        <b-table v-else :items="channel.producers" :fields="producerFields" small bordered responsive>
          <template #cell(id)="data">
            <b-form-input
              type="number"
              size="sm"
              :value="data.item.id"
              @input="updateProducerField(index, data.index, 'id', parseInt($event) || 0)"
              min="0"
              style="width: 80px;"
            />
          </template>
          <template #cell(command)="data">
            <b-form-input
              size="sm"
              :value="data.item.command"
              @input="updateProducerField(index, data.index, 'command', $event)"
              placeholder="e.g., PLAY 1-1 AMB LOOP"
            />
          </template>
          <template #cell(actions)="data">
            <b-button variant="danger" size="sm" @click="handleRemoveProducer(index, data.index)">
              <i class="fa fa-trash"></i>
            </b-button>
          </template>
        </b-table>
      </b-card>
    </b-card>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { VIDEO_MODES, COLOR_SPACE_OPTIONS } from '../../utils/casparcgConfigParser'
import ConsumersConfiguration from './ConsumersConfiguration.web.vue'

export default {
  name: 'ChannelsConfiguration',
  components: {
    ConsumersConfiguration,
  },
  data() {
    return {
      videoModes: VIDEO_MODES.map((m) => ({ value: m, text: m })),
      colorDepths: [
        { value: 8, text: '8-bit' },
        { value: 10, text: '10-bit' },
        { value: 12, text: '12-bit' },
        { value: 16, text: '16-bit' },
      ],
      colorSpaces: COLOR_SPACE_OPTIONS.map((c) => ({ value: c, text: c })),
      producerFields: [
        { key: 'id', label: 'ID', thStyle: { width: '100px' } },
        { key: 'command', label: 'Command' },
        { key: 'actions', label: '', thStyle: { width: '60px' } },
      ],
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['channels']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['addChannel', 'removeChannel', 'updateChannel', 'addProducer', 'removeProducer']),
    updateChannelField(index, field, value) {
      const channel = { ...this.channels[index] }
      channel[field] = value
      this.updateChannel({ index, channel })
    },
    handleAddProducer(channelIndex) {
      this.addProducer({ channelIndex, producer: { id: 0, command: '' } })
    },
    handleRemoveProducer(channelIndex, producerIndex) {
      this.removeProducer({ channelIndex, producerIndex })
    },
    updateProducerField(channelIndex, producerIndex, field, value) {
      const channel = { ...this.channels[channelIndex] }
      channel.producers = [...channel.producers]
      channel.producers[producerIndex] = { ...channel.producers[producerIndex], [field]: value }
      this.updateChannel({ index: channelIndex, channel })
    },
  },
}
</script>
