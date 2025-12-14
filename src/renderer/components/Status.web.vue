<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-alert show variant="info">
          <strong>Web Preview Mode</strong> - This is a demonstration of the CasparCG Launcher interface. The full
          Electron desktop app is required for actual process control.
        </b-alert>
        <b-table striped :items="processes" :fields="['name', { key: 'status', label: '' }]">
          <template #cell(name)="data">
            <b-link :to="'/' + data.item.id">
              {{ data.value }}
            </b-link>
          </template>
          <template #cell(status)="data">
            <process-controls :id="data.item.id" />
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ProcessControls from './ProcessControls.web.vue'

export default {
  components: {
    'process-controls': ProcessControls,
  },
  computed: {
    processes() {
      return this.$store.state.processes || []
    },
  },
  created() {
    for (let p of this.processes) {
      this.$store.dispatch('init', { id: p.id })
    }
  },
}
</script>

<style scoped></style>
