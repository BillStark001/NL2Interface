import Vue from 'vue'

import router from './routes'

import App from './App.vue'

import 'isomorphic-fetch'

import './styles.scss';

import Vuetiful from 'vuetiful/src/main.js'
import VModal from 'vue-js-modal'
import VueHighlightJS from 'vue-highlightjs'

Vue.use(Vuetiful) 
Vue.use(VModal)
Vue.use(VueHighlightJS)

new Vue({
  router,
  render: createEle => createEle(App)
}).$mount('#app')
