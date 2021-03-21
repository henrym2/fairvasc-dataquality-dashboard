<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Unique data percentage over time" subtitle="Average total of non-duplicate data over time" :id=0 @expand="maximise" :loading="loading">
          <line-chart :data="filterReg(uniqueOverTime)" :library="config.zoomAndPan" :download="true" suffix="%"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Average unique data percentage" subtitle="Average unique data percentage of the current dataset" :id=1 @expand="maximise" :loading="loading">
            <pie-chart :data="averageAll(filterReg(uniquenessData))" :download="true" suffix="%"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Uniqueness per field" subtitle="Percentage of non-duplicated data per field in the dataset" :id=2 @expand="maximise" :loading="loading">
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
            <column-chart :data="dataType(filterVals(filterReg(uniquenessData)), showCounts)" :library="config.zoomAndPan" :download="true" :suffix="showCounts ? '' : '%'"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      max-width="88vw"
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
            <line-chart v-if="maximised.id == 0" :library="config.zoomAndPan" :data="filterReg(uniqueOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <pie-chart v-if="maximised.id == 1" :data="averageAll(filterReg(uniquenessData))" :legend="true" suffix="%" :download="true"></pie-chart>
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="dataType(filterVals(filterReg(uniquenessData)), showCounts)" :suffix="showCounts ? '' : '%'" :download="true" height="70vh"></column-chart>
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
    name: 'Uniqueness',
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
      uniquenessData: [],
      uniqueOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {},
      config,
      showCounts: false,
      loading: false
    }),
    created() {
      this.getData()
      this.getUniqueOverTime()
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
      async getUniqueOverTime() {
        try {
          this.loading = true
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'unique'
          })
          this.uniqueOverTime = data
          this.loading = false
        } catch (e) {
          console.log(e)
          this.loading = false
        }
      },
      async getData() {
        try {
          this.loading = true
          let {data} = await this.axios.post(`${config.apiURL}/uniqueness`, 
            { registries: this.registries.map(e => e.Registry),
              set: this.set})
          this.uniquenessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.uniquenessData[0].data)
          this.filter = this.filterKeys
          this.loading = false
        } catch (e) {
          this.loading = false
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
