<template>
  <div class="consumers-section mt-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">Consumers</h6>
      <b-dropdown text="Add Consumer" size="sm" variant="outline-primary">
        <b-dropdown-item @click="addConsumer('screen')">Screen</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('system-audio')">System Audio</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('decklink')">Decklink</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('ndi')">NDI</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('ffmpeg')">FFmpeg</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('bluefish')">Bluefish</b-dropdown-item>
        <b-dropdown-item @click="addConsumer('artnet')">Art-Net</b-dropdown-item>
      </b-dropdown>
    </div>
    <b-list-group v-if="consumers.length > 0">
      <b-list-group-item
        v-for="(consumer, cIndex) in consumers"
        :key="cIndex"
        class="d-flex justify-content-between align-items-center"
      >
        <div class="flex-grow-1">
          <b-badge :variant="getConsumerVariant(consumer.type)" class="mr-2">
            {{ consumer.type.toUpperCase() }}
          </b-badge>
          <span class="text-muted small">{{ getConsumerSummary(consumer) }}</span>
        </div>
        <div>
          <b-button size="sm" variant="outline-info" class="mr-1" @click="editConsumer(cIndex)">
            <i class="fa fa-edit"></i>
          </b-button>
          <b-button size="sm" variant="outline-danger" @click="removeConsumerAt(cIndex)">
            <i class="fa fa-trash"></i>
          </b-button>
        </div>
      </b-list-group-item>
    </b-list-group>
    <p v-else class="text-muted small">No consumers configured</p>
    <consumer-edit-modal
      :show="showEditModal"
      :consumer="editingConsumer"
      :consumer-index="editingIndex"
      :channel-index="channelIndex"
      @close="closeEditModal"
      @save="saveConsumer"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ConsumerEditModal from './ConsumerEditModal.vue'

export default {
  name: 'ConsumersConfiguration',
  components: {
    ConsumerEditModal,
  },
  props: {
    channelIndex: {
      type: Number,
      required: true,
    },
    consumers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showEditModal: false,
      editingConsumer: null,
      editingIndex: -1,
    }
  },
  methods: {
    ...mapActions('CasparcgConfig', ['addConsumer', 'removeConsumer', 'updateConsumer']),
    getConsumerVariant(type) {
      const variants = {
        screen: 'primary',
        'system-audio': 'info',
        decklink: 'success',
        ndi: 'warning',
        ffmpeg: 'danger',
        bluefish: 'secondary',
        artnet: 'dark',
      }
      return variants[type] || 'secondary'
    },
    getConsumerSummary(consumer) {
      const c = consumer.config
      switch (consumer.type) {
        case 'screen':
          return c.device ? `Device ${c.device}` : 'Default'
        case 'decklink':
          return `Device ${c.device || 1}`
        case 'ndi':
          return c.name || 'Default name'
        case 'ffmpeg':
          return c.path || 'No path'
        case 'bluefish':
          return `Device ${c.device || 1}`
        case 'artnet':
          return `Universe ${c.universe || 0}`
        default:
          return ''
      }
    },
    addConsumer(type) {
      const consumer = { type, config: this.getDefaultConfig(type) }
      this.$store.dispatch('CasparcgConfig/addConsumer', {
        channelIndex: this.channelIndex,
        consumer,
      })
    },
    getDefaultConfig(type) {
      switch (type) {
        case 'screen':
          return { device: 1, windowed: true, stretch: 'fill' }
        case 'decklink':
          return { device: 1, embeddedAudio: true, latency: 'normal', keyer: 'external' }
        case 'ndi':
          return { name: '', allowFields: false }
        case 'ffmpeg':
          return { path: '', args: '' }
        case 'bluefish':
          return { device: 1, sdiStream: 1, embeddedAudio: true }
        case 'artnet':
          return { universe: 0, host: '127.0.0.1', port: 6454, refreshRate: 30, fixtures: [] }
        default:
          return {}
      }
    },
    removeConsumerAt(cIndex) {
      this.removeConsumer({
        channelIndex: this.channelIndex,
        consumerIndex: cIndex,
      })
    },
    editConsumer(cIndex) {
      this.editingIndex = cIndex
      this.editingConsumer = JSON.parse(JSON.stringify(this.consumers[cIndex]))
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingConsumer = null
      this.editingIndex = -1
    },
    saveConsumer(consumer) {
      this.updateConsumer({
        channelIndex: this.channelIndex,
        consumerIndex: this.editingIndex,
        consumer,
      })
      this.closeEditModal()
    },
  },
}
</script>
