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
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
      },
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
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
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
      error() {
        this.loading = false
        this.$emit("error", 
        { 
          text: "There was an error getting data for this set",
          state: true,
          color: "error"  
        })
      },
      extractKeys(obj) {
        return Object.keys(obj)
      },
      filterVals(arr) {
        return dataHandlers.filterVals(arr, this.filter)
      }
    }
  }
</script>
