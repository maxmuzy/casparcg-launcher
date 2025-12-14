import { getDefaultConfig } from '../../utils/casparcgConfigParser'

const state = {
  config: getDefaultConfig(),
  filePath: '',
  isDirty: false,
  isLoading: false,
  error: null,
}

const mutations = {
  SET_CONFIG(state, config) {
    state.config = config
    state.isDirty = false
  },

  UPDATE_CONFIG(state, { path, value }) {
    const keys = path.split('.')
    let obj = state.config
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) {
        obj[keys[i]] = {}
      }
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    state.isDirty = true
  },

  SET_FILE_PATH(state, filePath) {
    state.filePath = filePath
  },

  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  SET_DIRTY(state, isDirty) {
    state.isDirty = isDirty
  },

  ADD_CHANNEL(state) {
    state.config.channels.push({
      videoMode: 'PAL',
      colorDepth: 8,
      colorSpace: 'bt709',
      consumers: [],
      producers: [],
    })
    state.isDirty = true
  },

  REMOVE_CHANNEL(state, index) {
    state.config.channels.splice(index, 1)
    state.isDirty = true
  },

  UPDATE_CHANNEL(state, { index, channel }) {
    state.config.channels[index] = channel
    state.isDirty = true
  },

  ADD_CONSUMER(state, { channelIndex, consumer }) {
    state.config.channels[channelIndex].consumers.push(consumer)
    state.isDirty = true
  },

  REMOVE_CONSUMER(state, { channelIndex, consumerIndex }) {
    state.config.channels[channelIndex].consumers.splice(consumerIndex, 1)
    state.isDirty = true
  },

  UPDATE_CONSUMER(state, { channelIndex, consumerIndex, consumer }) {
    state.config.channels[channelIndex].consumers[consumerIndex] = consumer
    state.isDirty = true
  },

  ADD_PRODUCER(state, { channelIndex, producer }) {
    state.config.channels[channelIndex].producers.push(producer)
    state.isDirty = true
  },

  REMOVE_PRODUCER(state, { channelIndex, producerIndex }) {
    state.config.channels[channelIndex].producers.splice(producerIndex, 1)
    state.isDirty = true
  },

  ADD_OSC_CLIENT(state) {
    state.config.osc.predefinedClients.push({
      address: '127.0.0.1',
      port: 5253,
    })
    state.isDirty = true
  },

  REMOVE_OSC_CLIENT(state, index) {
    state.config.osc.predefinedClients.splice(index, 1)
    state.isDirty = true
  },

  UPDATE_OSC_CLIENT(state, { index, client }) {
    state.config.osc.predefinedClients[index] = client
    state.isDirty = true
  },

  RESET_CONFIG(state) {
    state.config = getDefaultConfig()
    state.isDirty = true
  },
}

const actions = {
  setConfig({ commit }, config) {
    commit('SET_CONFIG', config)
  },

  updateConfig({ commit }, { path, value }) {
    commit('UPDATE_CONFIG', { path, value })
  },

  setFilePath({ commit }, filePath) {
    commit('SET_FILE_PATH', filePath)
  },

  setLoading({ commit }, isLoading) {
    commit('SET_LOADING', isLoading)
  },

  setError({ commit }, error) {
    commit('SET_ERROR', error)
  },

  addChannel({ commit }) {
    commit('ADD_CHANNEL')
  },

  removeChannel({ commit }, index) {
    commit('REMOVE_CHANNEL', index)
  },

  updateChannel({ commit }, { index, channel }) {
    commit('UPDATE_CHANNEL', { index, channel })
  },

  addConsumer({ commit }, { channelIndex, consumer }) {
    commit('ADD_CONSUMER', { channelIndex, consumer })
  },

  removeConsumer({ commit }, { channelIndex, consumerIndex }) {
    commit('REMOVE_CONSUMER', { channelIndex, consumerIndex })
  },

  updateConsumer({ commit }, { channelIndex, consumerIndex, consumer }) {
    commit('UPDATE_CONSUMER', { channelIndex, consumerIndex, consumer })
  },

  addProducer({ commit }, { channelIndex, producer }) {
    commit('ADD_PRODUCER', { channelIndex, producer })
  },

  removeProducer({ commit }, { channelIndex, producerIndex }) {
    commit('REMOVE_PRODUCER', { channelIndex, producerIndex })
  },

  addOscClient({ commit }) {
    commit('ADD_OSC_CLIENT')
  },

  removeOscClient({ commit }, index) {
    commit('REMOVE_OSC_CLIENT', index)
  },

  updateOscClient({ commit }, { index, client }) {
    commit('UPDATE_OSC_CLIENT', { index, client })
  },

  resetConfig({ commit }) {
    commit('RESET_CONFIG')
  },
}

const getters = {
  config: (state) => state.config,
  filePath: (state) => state.filePath,
  isDirty: (state) => state.isDirty,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  channels: (state) => state.config.channels,
  paths: (state) => state.config.paths,
  controllers: (state) => state.config.controllers,
  osc: (state) => state.config.osc,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
