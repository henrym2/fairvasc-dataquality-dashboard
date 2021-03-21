<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Consistency Data Over Time" subtitle="Total average percentage of consistent data over time" :id=0 @expand="maximise">
          <line-chart :library="config.zoomAndPan" :data="filterReg(consistencyOverTime)" :download="true" suffix="%"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Average Total Consistency" subtitle="Total average percentage of cosistent data" :id=1 @expand="maximise">
            <bar-chart :data="averageAll(filterReg(consistencyData))" :download="true" suffix="%"></bar-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Consistency percentage per field" subtitle="Total consistent data per each individual field in the dataset" :id=2 @expand="maximise">
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
            <column-chart :library="config.zoomAndPan" :data="dataType(filterVals(filterReg(consistencyData)), showCounts)" :download="true" :suffix="showCounts ? '' : '%'"></column-chart>
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
            <line-chart v-if="maximised.id == 0" :library="config.zoomAndPan" :data="filterReg(consistencyOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <bar-chart v-if="maximised.id == 1" :data="averageAll(filterReg(consistencyData))" :legend="true" suffix="%" :download="true"></bar-chart>
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="dataType(filterVals(filterReg(consistencyData)), showCounts)" :suffix="showCounts ? '' : '%'" :download="true" height="70vh"></column-chart>
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

import config from "../config"
import dataHandlers from "../js/dataHandlers"
import computationHandlers from "../js/computationHandlers.js"


  export default {
    name: 'Consistency',
    components: {
      Widget,
      fieldValueGraphControls
    },
    props: {
      registries: Array,
      set: {},
      counts: Object
    },
    created() {
      this.getData()
      this.getConsistencyOverTime()
    },
    watch: {
      set() {
        this.getData()
      }
    },
    data: () => ({
      consistencyData: [],
      consistencyOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {},
      config,
      showCounts: false
    }),
    methods: {
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
      },
      dataType(data, type) {
        if (type) {
          return data.reduce((acc, cur) => {
            let tmp = {
              name: cur.name,
              data: computationHandlers.retrieveQuanta(cur.data, this.counts[cur.name]['unique_ids_total'])
            }
            acc.push(tmp)
            console.log(tmp)
            return acc
          }, [])
        } else {
          return data
        }
      },
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      async getConsistencyOverTime() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'consistency'
          })
          this.consistencyOverTime = data
        } catch (e) {
          console.log(e)
        }
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/consistency`, 
          { 
            registries: this.registries.map(e => e.Registry),
            set: this.set
          })
          this.consistencyData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.consistencyData[0].data)
          this.filter = this.filterKeys
        } catch (e) {
          console.log(e)
        }
      },
      error() {
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
