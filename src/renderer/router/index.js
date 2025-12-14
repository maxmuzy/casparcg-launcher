import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/settings',
      name: 'settings-page',
      component: require('../components/Settings').default,
    },
    {
      path: '/casparcg-config',
      name: 'casparcg-config-page',
      component: require('../components/config/CasparCGConfig').default,
    },
    {
      path: '/:id',
      name: 'process-page',
      component: require('../components/ProcessTab').default,
    },
    {
      path: '/',
      name: 'status-page',
      component: require('../components/Status').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
