<template>
  <div>
    <b-row>
      <b-col md="4">
        <b-form-group label="Device">
          <b-form-input type="number" :value="config.device" @input="update('device', parseInt($event) || 1)" min="1" />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="SDI Stream">
          <b-form-input
            type="number"
            :value="config.sdiStream"
            @input="update('sdiStream', parseInt($event) || 1)"
            min="1"
          />
        </b-form-group>
      </b-col>
      <b-col md="4">
        <b-form-group label="Watchdog">
          <b-form-input
            type="number"
            :value="config.watchdog"
            @input="update('watchdog', parseInt($event) || 2)"
            min="0"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="Keyer">
          <b-form-select :value="config.keyer" :options="keyerOptions" @change="update('keyer', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Internal Keyer Audio Source">
          <b-form-select
            :value="config.internalKeyerAudioSource"
            :options="audioSources"
            @change="update('internalKeyerAudioSource', $event)"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="UHD Mode">
          <b-form-select :value="config.uhdMode" :options="uhdModes" @change="update('uhdMode', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-checkbox :checked="config.embeddedAudio" @change="update('embeddedAudio', $event)" class="mt-4">
          Embedded Audio
        </b-form-checkbox>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'BluefishForm',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      keyerOptions: ['disabled', 'external', 'internal', 'external_separate_device'].map((k) => ({
        value: k,
        text: k,
      })),
      audioSources: ['videooutputchannel', 'sdivideoinput'].map((a) => ({ value: a, text: a })),
      uhdModes: [
        { value: 0, text: 'Disabled' },
        { value: 1, text: '2SI' },
        { value: 2, text: 'SQD' },
      ],
    }
  },
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
  },
}
</script>
