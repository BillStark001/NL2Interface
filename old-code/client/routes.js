import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './views/Home.vue'
import Demo from './views/Demo.vue'
// import Wizard from './views/Wizard.vue'

Vue.use(VueRouter)

const siteRoutes = [{
  path: '/',
  component: Home
}, {
  path: '/demo',
  component: Demo
}]

const vueRouter = new VueRouter({
  mode: 'history',
  routes: siteRoutes
})

export default vueRouter