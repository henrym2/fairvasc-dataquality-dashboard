<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Total missing data" subtitle="Total percentage of missing data" @expand="maximise" :id=0>
          <pie-chart :data="averageAll(filterReg(completenessData))" :legend="true" suffix="%" :download="true"></pie-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Total missing data over time" subtitle="Total percentage of missing data over a period of time" @expand="maximise" :id=1>
          <line-chart :data="filterReg(completenessOverTime)" :library="config.zoomAndPan" :legend="true" suffix="%" :download="true"></line-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Missing data per field" subtitle="Percentage of missing data in individal fields in the dataset" @expand="maximise" :id=2>
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
            <column-chart :data="filterVals(filterReg(completenessData))" :library="config.zoomAndPan" :download="true" suffix="%"></column-chart>
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
            <column-chart v-if="maximised.id == 2" :library="config.zoomAndPan" :data="filterVals(filterReg(completenessData))" suffix="%" :download="true" height="70vh"></column-chart>
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
import dataHandlers from "../js/dataHandlers.js"

  export default {
    name: 'Completeness',
    components: {
      Widget
    },
    props: {
      registries: Array,
      set: {}
    },
    data: () => ({
      completenessData: [],
      completenessOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {},
      config
    }),
    mounted() {
      this.getData()
      this.getCompletenessOverTime()
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
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      async getCompletenessOverTime() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'complete'
          })
          this.completenessOverTime = data  
        } catch (e) {
          console.log(e)
        }
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/completeness`, 
            { registries: this.registries.map(e => e.Registry),
              set: this.set })
          this.completenessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.completenessData[0].data)
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
