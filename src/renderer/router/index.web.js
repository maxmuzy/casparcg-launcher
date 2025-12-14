import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/settings',
      name: 'settings-page',
      component: require('../components/Settings.web.vue').default,
    },
    {
      path: '/:id',
      name: 'process-page',
      component: require('../components/ProcessTab.web.vue').default,
    },
    {
      path: '/',
      name: 'status-page',
      component: require('../components/Status.web.vue').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
