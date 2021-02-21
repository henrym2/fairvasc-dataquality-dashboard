<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Line Graph" subtitle="Time">
          <line-chart :data="{'2017-05-13': 2, '2017-05-14': 5}"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Pie Chart" subtitle="Berries">
            <pie-chart :data="averageAll(filterReg(consistencyData))"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Bar Graph" subtitle="Graph">
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
            <column-chart :data="filterVals(filterReg(consistencyData))"></column-chart>
        </Widget>
      </v-col>
    </v-row>
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
      registries: Array
    },
    created() {
      this.getData()
      
    },
    data: () => ({
      consistencyData: [],
      filterKeys: [],
      filter: []
    }),
    methods: {
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/consistency`, this.registries.map(e => e.Registry))
          this.consistencyData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.consistencyData[0].data)
          this.filter = this.filterKeys
        } catch (e) {
          console.log(e)
        }
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
