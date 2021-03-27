import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import vuetify from './plugins/vuetify';
import ChartKick from "vue-chartkick"
import highcharts from "highcharts"

Vue.config.productionTip = false
Vue.use(ChartKick.use(highcharts))
Vue.use(VueAxios, axios)

/**
 * Initialize the Vue instance
 */
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
