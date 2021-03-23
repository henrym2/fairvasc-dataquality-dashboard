<template>
  <v-app>
    <!-- Toolbar start -->
    <v-app-bar
      app
      color="primary"
      dark
      hide-on-scroll
    >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title>FAIRVASC Data Quality Dashboard</v-toolbar-title>

    <v-spacer>
    </v-spacer>
        
    <v-toolbar-items>
      <v-select
        class="mt-3"
        v-model="selectedTime"
        :items="daySeries"
        item-text="date"
        item-value="path"
        single-line
        return-object
      >
      </v-select>
      <v-menu
        :close-on-content-click="false"
        z-index="1001"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field 
            class="mt-3 ml-3"
            v-model="selectedDay"
            v-bind="attrs"
            v-on="on"
            readonly
          ></v-text-field>
        </template>
        <v-date-picker
          @change="changeDate"
          v-model="selectedDay"
          no-title
          scrollable
          :events="timeSeries.map(e => new Date(e.date).toISOString().substr(0,10))"
        >
        </v-date-picker>
      </v-menu>
    </v-toolbar-items>
    </v-app-bar>
    <!-- Toolbar end -->
    <!-- Drawer start -->
    <v-navigation-drawer
      v-model="drawer"
      app
    >
    <v-list>
      <v-list-item @click="changePage({id: -1})" >
        <v-list-item-icon><v-icon>home</v-icon></v-list-item-icon>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
        <v-list-item>
          <v-list-item-title class="text-subtitle-1 text--secondary">Registries</v-list-item-title>
          <v-list-item-action>
            <v-icon v-if="!multi" @click.stop="selectAll(true)">check_box_outline_blank</v-icon>
            <v-icon v-if="multi" @click.stop="selectAll(false)">indeterminate_check_box</v-icon>
          </v-list-item-action>
        </v-list-item>

        <v-list-item v-for="item in registryList" :key="`registry-${item.id}`" :value="item" ripple @click="item.selected = !item.selected">
            <v-list-item-content>
              <v-list-item-title v-text="item.Registry"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox
                :input-value="item.selected"
              ></v-checkbox>
            </v-list-item-action>
        </v-list-item>

      <v-divider></v-divider>
      <v-expansion-panels
        accordion
        hover
        :value="[0]"
        flat
        multiple
        style="width:15.9rem;padding:0vw"
      >
      <v-expansion-panel
        class="p-n1"
      >
        <v-expansion-panel-header>
          Metrics
        </v-expansion-panel-header>
        <v-expansion-panel-content>
        <v-list>
          <v-list-item-group>
          <v-list-item class="p-0" v-for="metric in metricsList" :key="metric.id" @click.stop="changePage(metric)">
            <v-list-item-title>{{metric.name}}</v-list-item-title>
            <v-list-item-icon><v-icon>{{metric.icon}}</v-icon></v-list-item-icon>

          </v-list-item>
          </v-list-item-group>
        </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
      </v-expansion-panels>
      <v-divider></v-divider>
      <v-list-item class="mt-3">
        <v-file-input
          v-model="file"
          :state="Boolean(file)"
          placeholder=".csv"
          outlined
          :show-size="1000"
          label="Quality csv"
          dense
        ></v-file-input>
        <v-list-item-action class="mb-9">
          <v-btn fab color="primary" @click=upload small><v-icon>publish</v-icon></v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    </v-navigation-drawer>
    <!-- Drawer start -->
    <!-- Content start -->
    <v-main>
        <main-page @navigate="(page) => {changePage(metricsList.find(e => e.name === page))}" v-if="currentPage === -1" :registries="registryList || []" :set="selectedTime" :counts="counts" @error="triggerSnack"></main-page>
        <metrics-page 
          v-if="metric !== ''" 
          :registries="registryList || []"
          :set="selectedTime" 
          @error="triggerSnack"
          :counts="counts" 
          :metric="metric"
          :events="timeSeries"
          ></metrics-page>
    </v-main>
    <!-- Content end -->
    <v-snackbar
      v-model="snackbar.state"
      :color="snackbar.color"
      :timeout="5000"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar.state = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Pages from './pages/pages.js'
import MetricsPage from "./components/MetricsPage.vue"

import config from "./config.js"
/**
 * @description Generate a random color value in hex
 */
var randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;
/**
 * @description Filter handler for checking if two dates are on the same day
 * @param {Date} first First date to compare
 * @param {Date} second Second date to compare
 * @returns {Boolean} 
 */
const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

export default {
  name: 'App',

  components: {
    ...Pages,
    MetricsPage
  },
  data: () => ({
    drawer: true,
    registryList: [],
    metricsList: [
      {id: 0, name: "Uniqueness", icon: "fingerprint", value: "unique"},
      {id: 1, name: "Consistency", icon: "panorama_fish_eye", value: "consistency"},
      {id: 2, name: "Completeness", icon: "assignment", value: "complete"},
      {id: 3, name: "Correctness", icon: "check_circle", value: "correct"}
    ],
    timeSeries: [],
    daySeries: [],
    selectedDay: new Date().toISOString().substr(0,10),
    selectedTime: {},
    currentPage: -1,
    metric: "",
    multi: false,
    file: null,
    snackbar: {
      text: "",
      state: false,
      color: "primary"
    },
    counts: {}
  }),
  computed: {
    /**
     * @description Pages returns the list of switchable pages including the main page
     * @returns {Object[]} An array of page objects
     */
    pages() {
      return [{id: -1, name: "Main Page"}, ...this.metricsList]
    },
  },
  /**
   * @description Runs all setup for the application including data fetching and event listeners for connection status
   */
  created() {
    this.getRegistries().then(() => this.getTimeSeries().then(() => this.getCounts()))
    window.addEventListener('offline', () => this.triggerSnack({ 
          text: "Looks like you might be offline, check your network connection and try again.",
          state: true,
          color: "warning"  
        }))  
  },
  watch: {
    registryList: {
      deep: true,
      handler(oldVal) {
        this.multi = oldVal.some(val => val.selected)
      }
    }
  },
  methods: {
    /**
     * @description Trigger the snackbar with the parameters contained in the snackbar trigger object
     * @param {{
     *  color: String,
     *  state: Boolean,
     *  text: String
     * }} trigger A trigger object for deciding the snackbar color and text
     */
    triggerSnack(trigger) {
      this.snackbar = trigger
    },
    /**
     * @description Changes the date and filters so that all entries in the time dropdown aree from that selected day
     * @param {String} input Input string in a simple EU date format
     */
    changeDate(input) {
      let selected = new Date(input)
      this.daySeries = this.timeSeries.filter(e => datesAreOnSameDay(new Date(e.date), selected))
    },
    /**
     * @async
     * @description Fetch time series data from the api, returns a list of dates and times
     */
    async getTimeSeries() {
      try {
        let { data } = await this.axios.get(`${config.apiURL}/csvList`)
        this.timeSeries = data
        this.selectedTime = data[0]
        this.selectedDay = new Date(data[0].date).toISOString().substr(0,10)
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * @async
     * @description Fetch counts data from the api
     */
    async getCounts() {
      try {
        let { data } = await this.axios.get(`${config.apiURL}/counts?registries=${this.registryList.map(e => e.Registry).join(',')}&set=${this.selectedTime.path || undefined}`)
        this.counts = data
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * @async
     * @description Upload a single CSV file to the API service
     */
    async upload () {
      if (this.file !== null) {
        let formData = new FormData()
        const filename = this.file.name.split('.')[0]
        formData.append('file', this.file)
        formData.append('name', filename)
        try {
          await this.axios.post(`${config.apiURL}/uploadCSV`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: {
                name: this.file.name
            }
          })
          this.file = null
          await this.getTimeSeries()
        } catch (e) {
          console.log(e, "Error")
        }
      }
    },
    /**
     * @description Change the current page based on the clicked metric list itme
     * @param {{
     *  id: Number,
     *  text: String, 
     *  value: String,
     *  icon: String
     * }} metric Metric page object
     */
    changePage(metric) {
      this.currentPage = metric.id
      this.metric = metric.value || ''
    },
    /**
     * @description Select or unselect all registries in the current registry list
     * @param {boolean} choice Boolean to chooce between select or unselect
     */
    selectAll(choice) {
      this.registryList = this.registryList.map(reg => ({
        ...reg,
        selected: choice
      }))
    },
    /**
     * @async
     * @description Get a list of registries for the data in question
     */
    async getRegistries() {
      let { data }  = await this.axios.get(`${config.apiURL}/registries`)
      this.registryList = data.map((e,i) => ({
        id: i, Registry: e, selected: true, color: String(randomColor())
      }))
    }
  }
};
</script>
<style lang="sass">

</style>