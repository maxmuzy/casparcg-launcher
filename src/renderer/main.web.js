import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueChatScroll from 'vue-chat-scroll'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.web.vue'
import router from './router/index.web'
import store from './store/index.web'

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueChatScroll)

const demoProcesses = [
  { id: 'casparcg', name: 'CasparCG' },
  { id: 'scanner', name: 'Media Scanner' },
]

demoProcesses.forEach((p) => {
  store.dispatch('init', { id: p.id })
  store.dispatch('setStatus', { id: p.id, status: 'stopped', showCommandSend: false })
})

store.commit('SET_PROCESSES', demoProcesses)

store.dispatch('logLine', {
  id: 'casparcg',
  data: {
    type: 'event',
    content: '[info] CasparCG Launcher Web Demo - Running in browser mode',
  },
})

store.dispatch('logLine', {
  id: 'casparcg',
  data: {
    type: 'event',
    content: '[info] Note: This is a web preview. The full Electron app is required for actual CasparCG control.',
  },
})

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app')
