<template>
  <div>
    <b-row>
      <b-col md="6">
        <b-form-group label="Device">
          <b-form-input type="number" :value="config.device" @input="update('device', parseInt($event) || 1)" min="1" />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Aspect Ratio">
          <b-form-select :value="config.aspectRatio" :options="aspectRatios" @change="update('aspectRatio', $event)" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <b-form-group label="Stretch">
          <b-form-select :value="config.stretch" :options="stretchOptions" @change="update('stretch', $event)" />
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Colour Space">
          <b-form-select :value="config.colourSpace" :options="colourSpaces" @change="update('colourSpace', $event)" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="3">
        <b-form-checkbox :checked="config.windowed" @change="update('windowed', $event)">
          Windowed
        </b-form-checkbox>
      </b-col>
      <b-col md="3">
        <b-form-checkbox :checked="config.borderless" @change="update('borderless', $event)">
          Borderless
        </b-form-checkbox>
      </b-col>
      <b-col md="3">
        <b-form-checkbox :checked="config.vsync" @change="update('vsync', $event)">
          VSync
        </b-form-checkbox>
      </b-col>
      <b-col md="3">
        <b-form-checkbox :checked="config.alwaysOnTop" @change="update('alwaysOnTop', $event)">
          Always on Top
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row class="mt-2">
      <b-col md="3">
        <b-form-checkbox :checked="config.keyOnly" @change="update('keyOnly', $event)">
          Key Only
        </b-form-checkbox>
      </b-col>
      <b-col md="3">
        <b-form-checkbox :checked="config.sbsKey" @change="update('sbsKey', $event)">
          SBS Key
        </b-form-checkbox>
      </b-col>
      <b-col md="3">
        <b-form-checkbox :checked="config.interactive" @change="update('interactive', $event)">
          Interactive
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col md="3">
        <b-form-group label="X">
          <b-form-input type="number" :value="config.x" @input="update('x', parseInt($event) || 0)" />
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Y">
          <b-form-input type="number" :value="config.y" @input="update('y', parseInt($event) || 0)" />
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Width">
          <b-form-input type="number" :value="config.width" @input="update('width', parseInt($event) || 0)" />
        </b-form-group>
      </b-col>
      <b-col md="3">
        <b-form-group label="Height">
          <b-form-input type="number" :value="config.height" @input="update('height', parseInt($event) || 0)" />
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { STRETCH_OPTIONS, ASPECT_RATIO_OPTIONS } from '../../../utils/casparcgConfigParser'

export default {
  name: 'ScreenForm',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      aspectRatios: ASPECT_RATIO_OPTIONS.map((a) => ({ value: a, text: a })),
      stretchOptions: STRETCH_OPTIONS.map((s) => ({ value: s, text: s })),
      colourSpaces: ['RGB', 'datavideo-full', 'datavideo-limited'].map((c) => ({ value: c, text: c })),
    }
  },
  methods: {
    update(field, value) {
      this.$emit('update', { [field]: value })
    },
  },
}
</script>
