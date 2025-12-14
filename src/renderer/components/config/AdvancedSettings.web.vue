<template>
  <b-card header="Advanced Settings" class="mb-3">
    <b-row>
      <b-col md="4">
        <b-form-group label="Log Level">
          <b-form-select
            :value="config.logLevel"
            :options="logLevels"
            @change="updateConfig({ path: 'logLevel', value: $event })"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Lock Clear Phrase">
          <b-form-input
            :value="config.lockClearPhrase"
            @input="updateConfig({ path: 'lockClearPhrase', value: $event })"
            placeholder="secret"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-checkbox
          :checked="config.logAlignColumns"
          @change="updateConfig({ path: 'logAlignColumns', value: $event })"
          class="mt-4"
        >
          Log Align Columns
        </b-form-checkbox>
      </b-col>
    </b-row>

    <hr />
    <h6>FFmpeg Producer</h6>
    <b-row>
      <b-col md="6">
        <b-form-group label="Auto Deinterlace">
          <b-form-select
            :value="config.ffmpeg.producer.autoDeinterlace"
            :options="deinterlaceOptions"
            @change="updateConfig({ path: 'ffmpeg.producer.autoDeinterlace', value: $event })"
          />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Threads">
          <b-form-input
            type="number"
            :value="config.ffmpeg.producer.threads"
            @input="updateConfig({ path: 'ffmpeg.producer.threads', value: parseInt($event) || 4 })"
            min="1"
          />
        </b-form-group>
      </b-col>
    </b-row>

    <hr />
    <h6>HTML / CEF</h6>
    <b-row>
      <b-col md="4">
        <b-form-group label="Remote Debugging Port">
          <b-form-input
            type="number"
            :value="config.html.remoteDebuggingPort"
            @input="updateConfig({ path: 'html.remoteDebuggingPort', value: parseInt($event) || 0 })"
            min="0"
          />
          <b-form-text>0 = disabled</b-form-text>
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Angle Backend">
          <b-form-select
            :value="config.html.angleBackend"
            :options="angleBackends"
            @change="updateConfig({ path: 'html.angleBackend', value: $event })"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-checkbox
          :checked="config.html.enableGpu"
          @change="updateConfig({ path: 'html.enableGpu', value: $event })"
          class="mt-4"
        >
          Enable GPU
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-form-group label="Cache Path">
      <b-form-input
        :value="config.html.cachePath"
        @input="updateConfig({ path: 'html.cachePath', value: $event })"
        placeholder="Leave empty for default"
      />
    </b-form-group>

    <hr />
    <h6>Flash</h6>
    <b-row>
      <b-col md="6">
        <b-form-checkbox
          :checked="config.flash.enabled"
          @change="updateConfig({ path: 'flash.enabled', value: $event })"
        >
          Enable Flash
        </b-form-checkbox>
      </b-col>
      <b-col md="6">
        <b-form-group label="Buffer Depth">
          <b-form-input
            :value="config.flash.bufferDepth"
            @input="updateConfig({ path: 'flash.bufferDepth', value: $event })"
            placeholder="auto"
          />
        </b-form-group>
      </b-col>
    </b-row>

    <hr />
    <h6>NDI</h6>
    <b-form-checkbox
      :checked="config.ndi.autoLoad"
      @change="updateConfig({ path: 'ndi.autoLoad', value: $event })"
    >
      Auto Load NDI
    </b-form-checkbox>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { LOG_LEVELS, AUTO_DEINTERLACE_OPTIONS, ANGLE_BACKEND_OPTIONS } from '../../utils/casparcgConfigParser'

export default {
  name: 'AdvancedSettings',
  data() {
    return {
      logLevels: LOG_LEVELS.map((l) => ({ value: l, text: l })),
      deinterlaceOptions: AUTO_DEINTERLACE_OPTIONS.map((d) => ({ value: d, text: d })),
      angleBackends: ANGLE_BACKEND_OPTIONS.map((a) => ({ value: a, text: a || 'Default' })),
    }
  },
  computed: {
    ...mapGetters('CasparcgConfig', ['config']),
  },
  methods: {
    ...mapActions('CasparcgConfig', ['updateConfig']),
  },
}
</script>
