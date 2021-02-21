<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Total missing" subtitle="Total percentage missing">
            <pie-chart :data="averageAll(filterReg(completenessData))" :legend="true" suffix="%"></pie-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Line Graph" subtitle="Time">
          <line-chart :data="{'2017-05-13': 2, '2017-05-14': 5}"></line-chart>
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
            <column-chart :data="filterVals(filterReg(completenessData))"></column-chart>
        </Widget>
      </v-col>
    </v-row>
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
      registries: Array
    },
    data: () => ({
      completenessData: [],
      filterKeys: [],
      filter: []

    }),
    mounted() {
      this.getData()
    },
    methods: {
      filterReg (arr) {
        return dataHandlers.filterReg(arr, this.registries)
      },
      averageAll(arr) {
        return dataHandlers.averageAll(arr)
      },
      async getData() {
        try {
          let {data} = await this.axios.post(`${config.apiURL}/completeness`, this.registries.map(e => e.Registry))
          this.completenessData = Object.keys(data).map(e => {
            return {name: e, data: data[e]}
          })
          this.filterKeys = this.extractKeys(this.completenessData[0].data)
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
