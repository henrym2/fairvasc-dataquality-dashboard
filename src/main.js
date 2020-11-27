import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import ChartKick from "vue-chartkick"
import Chart from 'chart.js'

Vue.config.productionTip = false
Vue.use(ChartKick.use(Chart))
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
