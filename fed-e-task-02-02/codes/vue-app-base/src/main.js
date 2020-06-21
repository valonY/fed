import './style.less'

import App from './App.vue'
import Vue from 'vue'
import { test } from '@/utils'

test()

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')
