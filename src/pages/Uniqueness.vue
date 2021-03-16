<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Unique data percentage over time" subtitle="Average total of non-duplicate data over time" :id=0 @expand="maximise">
          <line-chart :data="filterReg(uniqueOverTime)" :download="true"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Average unique data percentage" subtitle="Average unique data percentage of the current dataset" :id=1 @expand="maximise">
            <pie-chart :data="averageAll(filterReg(uniquenessData))" :download="true"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Uniqueness per field" subtitle="Percentage of non-duplicated data per field in the dataset" :id=2 @expand="maximise">
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
            <column-chart :data="filterVals(filterReg(uniquenessData))" :download="true"></column-chart>
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
            <line-chart v-if="maximised.id == 0" :data="filterReg(uniqueOverTime)" :legend="true" suffix="%" :download="true" height="70vh"></line-chart>
            <pie-chart v-if="maximised.id == 1" :data="averageAll(filterReg(uniquenessData))" :legend="true" suffix="%" :download="true"></pie-chart>
            <column-chart v-if="maximised.id == 2" :data="filterVals(filterReg(uniquenessData))" suffix="%" :download="true" height="70vh"></column-chart>
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
    name: 'Uniqueness',
    components: {
      Widget
    },
    props: {
      registries: Array,
      set: {}

    },
    data: () => ({
      uniquenessData: [],
      uniqueOverTime: [],
      filterKeys: [],
      filter: [],
      dialog: false,
      maximised: {}
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
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      async getUniqueOverTime() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/timeData`, {
            'registries': this.registries.map(e => e.Registry),
            'metric': 'unique'
          })
          this.uniqueOverTime = data
        } catch (e) {
          console.log(e)
        }
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/uniqueness`, 
            { registries: this.registries.map(e => e.Registry),
              set: this.set})
          this.uniquenessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.uniquenessData[0].data)
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
