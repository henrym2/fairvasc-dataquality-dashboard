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
            <v-select
            style="max-width: 15rem"
              :items="filterKeys"
              v-model="filter"
              multiple
            >
              <template v-slot:selection="{ item, index}">
                <v-chip v-if="index === 0">
                  <span> {{item}}</span>
                </v-chip>
                <span
                  v-if="index === 1"
                  class="grey--text caption"
                >
                  (+{{ filter.length - 1 }})
                </span>
              </template>
            </v-select>
          </template>
            <column-chart :library="config.zoomAndPan" :data="filterVals(filterReg(consistencyData))" :download="true" suffix="%"></column-chart>
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
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="filterVals(filterReg(consistencyData))" suffix="%" :download="true" height="70vh"></column-chart>
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
import config from "../config"
import dataHandlers from "../js/dataHandlers"

  export default {
    name: 'Consistency',
    components: {
      Widget
    },
    props: {
      registries: Array,
      set: {}

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
      config
    }),
    methods: {
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
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
