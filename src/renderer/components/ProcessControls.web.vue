<template>
  <div id="process-controls">
    <span>
      {{ data.status }}
    </span>
    <b-button-group>
      <b-button v-if="showClear" variant="warning" @click="clearLog"> Clear Log </b-button>
      <b-button variant="success" v-on:click="start"> Start </b-button>
      <b-button variant="danger" v-on:click="stop"> Stop </b-button>
      <b-button variant="info" v-on:click="restart"> Restart </b-button>
    </b-button-group>
  </div>
</template>

<script>
export default {
  props: ['id', 'showClear'],
  data() {
    return {
      data: this.$store.state.Process[this.id] || { status: 'stopped' },
    }
  },
  created() {
    this.$store.dispatch('init', { id: this.id })
  },
  methods: {
    clearLog() {
      this.$store.dispatch('logClear', { id: this.id })
    },
    stop() {
      this.$store.dispatch('setStatus', { id: this.id, status: 'stopped', showCommandSend: false })
      this.$store.dispatch('logLine', {
        id: this.id,
        data: { type: 'event', content: '[Web Preview] Stop command simulated' },
      })
    },
    start() {
      this.$store.dispatch('setStatus', { id: this.id, status: 'running', showCommandSend: true })
      this.$store.dispatch('logLine', {
        id: this.id,
        data: { type: 'event', content: '[Web Preview] Start command simulated' },
      })
    },
    restart() {
      this.$store.dispatch('setStatus', { id: this.id, status: 'restarting', showCommandSend: false })
      this.$store.dispatch('logLine', {
        id: this.id,
        data: { type: 'event', content: '[Web Preview] Restart command simulated' },
      })
      setTimeout(() => {
        this.$store.dispatch('setStatus', { id: this.id, status: 'running', showCommandSend: true })
      }, 1000)
    },
  },
}
</script>

<style scoped>
#process-controls {
  text-align: right;
}
.btn-group {
  margin: 15px;
}
</style>
