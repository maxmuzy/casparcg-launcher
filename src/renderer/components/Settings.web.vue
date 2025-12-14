<template>
  <b-container fluid>
    <b-form @submit="onSubmit" @reset="onReset">
      <b-row>
        <b-col id="content">
          <b-alert show variant="info">
            <strong>Web Preview Mode</strong>
            <p>
              This is a web preview of the CasparCG Launcher. The full Electron desktop app is required for actual
              process control and configuration.
            </p>
          </b-alert>

          <legend>Processes</legend>
          <b-form-group
            id="basePathInputGroup"
            label="Base Path:"
            label-for="basePathInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-input-group>
              <b-form-input id="basePathInput" type="text" v-model="config.basePath" placeholder="./" disabled>
              </b-form-input>
            </b-input-group>
          </b-form-group>

          <b-form-group
            id="logsPathInputGroup"
            label="Logs Path:"
            label-for="logsPathInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-input-group>
              <b-form-input id="logsPathInput" type="text" v-model="config.logsPath" placeholder="logs/" disabled />
            </b-input-group>
          </b-form-group>

          <b-form-group id="processesGroup" label-for="processesTable">
            <b-table-simple striped>
              <b-thead>
                <b-th> Name </b-th>
              </b-thead>
              <b-tbody>
                <template v-for="(data, index) in config.processes">
                  <b-tr v-bind:key="'row-' + index">
                    <b-td>
                      {{ config.processes[index].name || 'Process ' + (index + 1) }}
                    </b-td>
                  </b-tr>
                </template>
              </b-tbody>
            </b-table-simple>
          </b-form-group>

          <legend>HTTP</legend>
          <b-form-group
            id="httpApiEnableGroup"
            label="Enable HTTP Server:"
            label-for="httpApiEnableInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-form-checkbox id="httpApiEnableInput" v-model="config.api.enable" disabled> </b-form-checkbox>
          </b-form-group>

          <b-form-group
            id="httpApiPortGroup"
            label="HTTP Server Port:"
            label-for="httpApiPortInput"
            label-cols-sm="4"
            label-cols-lg="3"
            content-cols-sm
            content-cols-lg="7"
          >
            <b-form-input id="httpApiPortInput" type="number" v-model="config.api.port" placeholder="8005" disabled />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row id="footer">
        <b-col>
          <b-button type="submit" variant="primary" disabled> Save (Disabled in Web Preview) </b-button>
        </b-col>
        <b-col id="version">
          <p class="text-right">Version: {{ version }} (Web Preview)</p>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
const packageJson = require('../../../package.json')

export default {
  data() {
    return {
      version: packageJson.version,
      config: {
        basePath: './',
        logsPath: 'logs/',
        api: {
          enable: false,
          port: 8005,
          staticPaths: [],
        },
        processes: [{ name: 'CasparCG' }, { name: 'Media Scanner' }],
      },
    }
  },

  methods: {
    onSubmit(evt) {
      evt.preventDefault()
      alert('Settings cannot be saved in web preview mode. Please use the Electron desktop app.')
    },
    onReset(evt) {
      evt.preventDefault()
    },
  },
}
</script>

<style lang="scss" scoped>
$button-height: 40px;
$footer-padding: 1rem;
$footer-height: calc(#{$button-height} + #{2 * $footer-padding});
#content {
  margin-bottom: $footer-height;
}
#footer {
  background: #f8f9fa;
  bottom: 0;
  width: 100%;
  height: $footer-height;
  padding-top: $footer-padding;
  position: fixed;
}
#version {
  padding-top: 0.375rem;
}
</style>
