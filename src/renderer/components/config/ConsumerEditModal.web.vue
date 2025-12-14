<template>
  <b-modal
    :visible="show"
    :title="`Edit ${consumer ? consumer.type.toUpperCase() : ''} Consumer`"
    size="lg"
    @hide="$emit('close')"
    @ok="handleSave"
  >
    <template v-if="consumer">
      <screen-form v-if="consumer.type === 'screen'" :config="localConfig" @update="updateConfig" />
      <decklink-form v-else-if="consumer.type === 'decklink'" :config="localConfig" @update="updateConfig" />
      <ndi-form v-else-if="consumer.type === 'ndi'" :config="localConfig" @update="updateConfig" />
      <ffmpeg-form v-else-if="consumer.type === 'ffmpeg'" :config="localConfig" @update="updateConfig" />
      <bluefish-form v-else-if="consumer.type === 'bluefish'" :config="localConfig" @update="updateConfig" />
      <artnet-form v-else-if="consumer.type === 'artnet'" :config="localConfig" @update="updateConfig" />
      <p v-else class="text-muted">No configuration options for this consumer type</p>
    </template>
  </b-modal>
</template>

<script>
import ScreenForm from './consumers/ScreenForm.web.vue'
import DecklinkForm from './consumers/DecklinkForm.web.vue'
import NdiForm from './consumers/NdiForm.web.vue'
import FfmpegForm from './consumers/FfmpegForm.web.vue'
import BluefishForm from './consumers/BluefishForm.web.vue'
import ArtnetForm from './consumers/ArtnetForm.web.vue'

export default {
  name: 'ConsumerEditModal',
  components: {
    ScreenForm,
    DecklinkForm,
    NdiForm,
    FfmpegForm,
    BluefishForm,
    ArtnetForm,
  },
  props: {
    show: Boolean,
    consumer: Object,
    consumerIndex: Number,
    channelIndex: Number,
  },
  data() {
    return {
      localConfig: {},
    }
  },
  watch: {
    consumer: {
      immediate: true,
      handler(val) {
        if (val) {
          this.localConfig = JSON.parse(JSON.stringify(val.config || {}))
        }
      },
    },
  },
  methods: {
    updateConfig(config) {
      this.localConfig = { ...this.localConfig, ...config }
    },
    handleSave(bvModalEvt) {
      bvModalEvt.preventDefault()
      this.$emit('save', { type: this.consumer.type, config: this.localConfig })
    },
  },
}
</script>
