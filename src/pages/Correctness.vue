<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Average Correctness of Data Over Time" subtitle="Average total correctness of data over time" :id=0 @expand="maximise">
          <line-chart :data="filterReg(correctnessOverTime)" :library="config.zoomAndPan" :download="true" suffix="%"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Average total correctness" subtitle="Average total correctness of the current dataset" :id=1 @expand="maximise">
            <pie-chart :data="averageAll(filterReg(correctnessData))" :download="true" suffix="%"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Correctness percentage per field" subtitle="Percentage of correct data per field in the dataset" :id=2 @expand="maximise">
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
            <column-chart :data="dataType(filterVals(filterReg(correctnessData)), showCounts)" :library="config.zoomAndPan" :download="true" :suffix="showCounts ? '' : '%'"></column-chart>
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
            <line-chart v-if="maximised.id == 0" :library="config.zoomAndPan" :data="filterReg(correctnessOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <pie-chart v-if="maximised.id == 1" :data="averageAll(filterReg(correctnessData))" :legend="true" suffix="%" :download="true"></pie-chart>
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="filterVals(filterReg(correctnessData))" suffix="%" :download="true" height="70vh"></column-chart>
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
    name: 'Correctness',
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
      this.getCorrectnessOverTime()
    },
    watch: {
      set() {
        this.getData()
      }
    },
    data: () => ({
      correctnessData: [],
      correctnessOverTime: [],
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
      async getCorrectnessOverTime() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'correct'
          })
          this.correctnessOverTime = data
        } catch (e) {
          console.log(e)
        }
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/correctness`, 
          { 
            registries: this.registries.map(e => e.Registry),
            set: this.set
          })
          this.correctnessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.correctnessData[0].data)
          this.filter = this.filterKeys
        }
        catch (e) {
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
