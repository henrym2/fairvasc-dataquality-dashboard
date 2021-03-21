<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Total missing data" subtitle="Total percentage of missing data" @expand="maximise" :id=0 :loading="loading">
          <pie-chart :data="averageAll(filterReg(completenessData))" :legend="true" suffix="%" :download="true"></pie-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Total missing data over time" subtitle="Total percentage of missing data over a period of time" @expand="maximise" :id=1 :loading="loading">
          <line-chart :data="filterReg(completenessOverTime)" :library="config.zoomAndPan" :legend="true" suffix="%" :download="true"></line-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Missing data per field" subtitle="Percentage of missing data in individal fields in the dataset" @expand="maximise" :id=2 :loading="loading">
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
            <column-chart :data="dataType(filterVals(filterReg(completenessData)), showCounts)" :library="config.zoomAndPan" :download="true" :suffix="showCounts ? '' : '%'"></column-chart>
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
            <pie-chart v-if="maximised.id == 0" :data="averageAll(filterReg(completenessData))" :legend="true" suffix="%" :download="true"></pie-chart>
            <line-chart v-if="maximised.id == 1" :library="config.zoomAndPan" :data="filterReg(completenessOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <column-chart v-if="maximised.id == 2" :data="dataType(filterVals(filterReg(completenessData)), showCounts)" :library="config.zoomAndPan" :download="true" :suffix="showCounts ? '' : '%'" height="70vh"></column-chart>
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
import dataHandlers from "../js/dataHandlers.js"
import computationHandlers from "../js/computationHandlers.js"

  export default {
    name: 'Completeness',
    components: {
      Widget,
      fieldValueGraphControls
    },
    props: {
      registries: Array,
      set: {},
      counts: Object
    },
    data: () => ({
      completenessData: [],
      completenessOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {},
      config,
      showCounts: false,
      loading: false
    }),
    mounted() {
      this.getData()
      this.getCompletenessOverTime()
      console.log(this.$vuetify.breakpoint.mobile)
    },
    watch: {
      set() {
        this.getData()
      }
    },
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
      async getCompletenessOverTime() {
        try {
          this.loading = true
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'complete'
          })
          this.completenessOverTime = data  
          this.loading = false
        } catch (e) {
          this.error()
          console.log(e)
        }
      },
      async getData() {
        try {
          this.loading = true
          let {data} = await this.axios.post(`${config.apiURL}/completeness`, 
            { registries: this.registries.map(e => e.Registry),
              set: this.set })
          this.completenessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.completenessData[0].data)
          this.filter = this.filterKeys
          this.loading = false
        } catch (e) {
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
