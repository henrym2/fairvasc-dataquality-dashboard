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
            <column-chart :data="filterVals(filterReg(correctnessData))" :library="config.zoomAndPan" :download="true" suffix="%"></column-chart>
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
import config from "../config"
import dataHandlers from "../js/dataHandlers"

  export default {
    name: 'Correctness',
    components: {
      Widget
    },
    props: {
      registries: Array,
      set: {}

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
