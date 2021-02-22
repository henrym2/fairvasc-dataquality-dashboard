<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of duplicated entries">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Uniqueness')">Uniqueness</a>
          </template>
          <column-chart label="Percentage of duplicated data" :colors="registries.map(r => r.color)" suffix="%" :data="filterReg(unique)" :download="true"></column-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget subtitle="Percentage of empty or missing datapoints across all registires">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Completeness')">Completeness</a>
            </template>
            <column-chart label="Percentage of missing data" :colors="registries.map(r => r.color)" suffix="%" :data="filterReg(complete)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrect values">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Correctness')">Correctness</a>
            </template>
            <bar-chart label="Percentage of incorrect data" :colors="registries.map(r => r.color)" suffix="%" :data="filterReg(correct)" :download="true"></bar-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrectly formatted data">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Consistency')">Consistency</a>
          </template>
          <column-chart label="Inconsistent data" :colors="registries.map(r => r.color)" :data="filterReg(consistent)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Widget from "../components/Widget.vue"
import config from "../config"

  export default {
    name: 'mainPage',
    components: {
      Widget
    },
    props: {
      registries: Array,
      pages: Array
    },
    data: () => ({
      unique: [],
      complete: [],
      correct: [],
      consistent: [],
      retry: false
    }),
    mounted() {
      this.getData()
    },
    methods: {
      filterReg (arr) {
        let reg = this.registries.filter(r => r.selected).map(r => r.Registry);
        return arr.filter(d => reg.includes(d[0]))
      },
      async getData() {
        try {
          let promises = ['unique', 'complete', 'consistency', 'correct']
          promises = promises.map(e => this.axios.post(`${config.apiURL}/totals/${e}`, this.registries.map(e => e.Registry)))
          let data = await Promise.allSettled(promises)
          this.unique = this.formatData(data[0].value.data) 
          this.complete = this.formatData(data[1].value.data) 
          this.consistent = this.formatData(data[2].value.data) 
          this.correct = this.formatData(data[3].value.data) 
        } catch (e) {
          if (!this.retry) {
            this.getData()
            this.retry = true
          }
          console.log(e)
        }
      },
      navigate(page) {
        this.$emit("navigate", page)
      },
      formatData(data) {
        return Object.keys(data).map(e => (
          [e, data[e]]
        ))
      }
    }
  }
</script>
