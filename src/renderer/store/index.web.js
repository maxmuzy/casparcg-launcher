import Vue from 'vue'
import Vuex from 'vuex'

import Process from './modules/Process'
import CasparcgConfig from './modules/CasparcgConfig'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    Process,
    CasparcgConfig,
  },
  state: {
    processes: [],
  },
  mutations: {
    SET_PROCESSES(state, processes) {
      state.processes = processes
    },
  },
  strict: process.env.NODE_ENV !== 'production',
})

export default store
