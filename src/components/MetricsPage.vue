<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget :title="`Average ${this.metricTitle} of Data Over Time`" :subtitle="`Average total ${this.metric} of data over time`" :id=0 @expand="maximise" :loading="loading">
          <template v-slot:controls>
            <time-range-selector
              @rangeChange="getMetricsOverTime"
              :beginning="new Date(events[events.length-1].date).toISOString().substr(0,10)"
              :end="new Date(events[0].date).toISOString().substr(0,10)"
              :events="events"
            >
            </time-range-selector>
          </template>
          <line-chart :data="filterReg(dataOverTime)" :library="config.zoomAndPan" :download="true" suffix="%"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget :title="`Average total ${this.metric}`" :subtitle="`Average total ${this.metric} of the current dataset`" :id=1 @expand="maximise" :loading=loading>
            <pie-chart :data="averageAll(filterReg(data))" :download="true" suffix="%"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget :title="`${this.metricTitle} percentage per field`" :subtitle="`Percentage of ${this.metric} data per field in the dataset`" :id=2 @expand="maximise" :loading="loading">
          <template v-slot:controls>
              <field-value-graph-controls
                :filter.sync="filter"
                :filterKeys="filterKeys"
                :showCounts="showCounts"
                @countClick="(v) => showCounts = v"
                @filtered="(f) => filter = f"
              >
              </field-value-graph-controls>
          </template>
            <column-chart :data="dataType(filterVals(filterReg(data)), showCounts)" :library="config.zoomAndPan" :download="true" :suffix="showCounts ? '' : '%'"></column-chart>
        </Widget>
      </v-col>
    </v-row>
     <v-dialog
      v-model="dialog"
      max-width="85vw"
      class="p-5"
    >
      <v-card
        elevation="3"
      >
        <v-toolbar flat>
          <v-toolbar-title>
          <v-card-title>{{ maximised.name }}</v-card-title>
          <v-card-subtitle>{{ maximised.subtitle}}</v-card-subtitle>
          </v-toolbar-title>
        </v-toolbar>
        <v-divider/>
            <line-chart v-if="maximised.id == 0" :library="config.zoomAndPan" :data="filterReg(dataOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <pie-chart v-if="maximised.id == 1" :data="averageAll(filterReg(data))" :legend="true" suffix="%" :download="true"></pie-chart>
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="dataType(filterVals(filterReg(data)), showCounts)" :suffix="showCounts ? '' : '%'" :download="true" height="70vh"></column-chart>
        <v-divider/>
          <v-card-actions>
            <v-btn color="success" class="ml-auto" @click="dialog=false">Close</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Widget from "../components/Widget.vue"
import fieldValueGraphControls from "../components/fieldValueGraphControls.vue"
import TimeRangeSelector from "../components/TimeRangeSelector.vue"


import config from "../config"
import dataHandlers from "../js/dataHandlers"
import computationHandlers from "../js/computationHandlers.js"


  export default {
    name: 'Correctness',
    components: {
      Widget,
      fieldValueGraphControls,
      TimeRangeSelector
    },
    props: {
      registries: Array,
      set: Object,
      counts: Object,
      metric: String,
      events: Array
    },
    computed: {
      metricTitle () {
        return this.metric[0].toUpperCase() + this.metric.slice(1);
      }
    },
    created() {
      this.getData()
      this.getMetricsOverTime(new Date(this.events[this.events.length-1].date), new Date(this.events[0].date))
    },
    watch: {
      set() {
        this.getData()
      },
      metric() {
        this.getData()
        this.getMetricsOverTime(new Date(this.events[this.events.length-1].date), new Date(this.events[0].date))
      }
    },
    data: () => ({
      data: [],
      dataOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {},
      config,
      showCounts: false,
      loading: false
    }),
    methods: {
      /**
       * @description Method for deciding which graph to display in maximised dialog
       * @param {{
       *  id: number,
       *  title: string,
       *  subtitle: string
       * }} toMaximise Object emitted by the Widget component
       */
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
      },
      /**
       * @description Method for switching between percentage values and "total count" metric values
       * @param {Array} data Array containing all metric data retrieved from API
       * @param {boolean} type Boolean for deciding which metric type to show, True for counts, false for percentages
       */
      dataType(data, type) {
        let out = data
        if (type) {
          out = data.reduce((acc, cur) => {
            let tmp = {
              name: cur.name,
              data: computationHandlers.retrieveQuanta(cur.data, this.counts[cur.name]['unique_ids_total'])
            }
            acc.push(tmp)
            return acc
          }, [])
        } 
        return out
      },
      /**
       * @description Filter out data based on the selected registries
       * @param {array} arr Data array
       * @returns {array} Data array containing only selected registries 
       */
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      /**
       * @description Average all metrics in each given registry and return the registry and associated average
       * @param {arr} arr Data array
       * @returns {{
       *  registry: number
       * }[]} Returns an array of key value pairs, each ley being a registry and each value being its average metric value
       */
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      /**
       * @description retrieve metric values over time based on a given date:time range from start to end
       * @param {string} start start date
       * @param {string} end end date
       */
      async getMetricsOverTime(start, end) {
        try {
          console.log(start, end)
          let startDate = new Date(start)
          let endDate = new Date(end)
          this.loading = true
          let {data} = await this.axios.get(`${config.apiURL}/timeData/${this.metric}?registries=${this.registries.map(e => e.Registry).join(',')}&start=${startDate.getTime()}&end=${endDate.getTime()}`)
          this.dataOverTime = data
          this.loading = false
        } catch (e) {
          this.error()
          console.log(e)
        }
      },
      /**
       * @description Retrieve the specific metric data from the API 
       */
      async getData() {
        try {
          this.loading = true
          let {data} = await this.axios.get(
            `${config.apiURL}/metrics/${this.metric}?registries=${this.registries.map(e => e.Registry).join(',')}&set=${this.set.path}`)
          this.data = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.data[0].data)
          this.filter = this.filterKeys
          this.loading = false
        }
        catch (e) {
          this.error()
          console.log(e)
        }
      },
      /**
       * @description Error emission handler for triggering the error event to be caught by the parent component
       */
      error() {
        this.loading = false
        this.$emit("error", 
        { 
          text: "There was an error getting data for this set",
          state: true,
          color: "error"  
        })
      },
      /**
       * @description SImple handler interface for retrieving keys for an object
       * @param {Object} obj 
       * @returns {string[]} Array of object keys
       */
      extractKeys(obj) {
        return Object.keys(obj)
      },
      /**
       * @description Handler for filtering values based on selected fields
       * @param {object[]} arr Input data array
       * @returns {object[]} Output data array filtered by field values
       */
      filterVals(arr) {
        return dataHandlers.filterVals(arr, this.filter)
      }
    }
  }
</script>
