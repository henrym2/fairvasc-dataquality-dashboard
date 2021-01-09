<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Uniqueness" subtitle="Percentage of duplicated entries">
          <column-chart label="Percentage of duplicated data" :colors="[registries.map(r => r.color)]" suffix="%" :data="filterReg(duplicated)" :download="true"></column-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Completeness" subtitle="Percentage of empty or missing datapoints across all registires">
            <column-chart label="Percentage of missing data" :colors="[registries.map(r => r.color)]" suffix="%" :data="filterReg(complete)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Correctness" subtitle="Percentage of incorrect values">
            <bar-chart label="Percentage of incorrect data" :colors="[registries.map(r => r.color)]" suffix="%" :data="filterReg(correct)" :download="true"></bar-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Consistency" subtitle="Percentage of incorrectly formatted data">
          <column-chart label="Percentage of missing data" :colors="[registries.map(r => r.color)]" suffix="%" :data="filterReg(consistent)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Widget from "../components/Widget.vue"

  export default {
    name: 'mainPage',
    components: {
      Widget
    },
    props: {
      registries: Array
    },
    data: () => ({
      duplicated: [['Dublin', 10], ['Lund', 2], ['Poland', 4], ['France', 6]],
      complete: [['Dublin', 11], ['Lund', 23], ['Poland', 22], ['France', 15]],
      correct: [['Dublin', 44], ['Lund', 23], ['Poland', 35], ['France', 10]],
      consistent: [['Dublin', 12], ['Lund', 40], ['Poland', 35], ['France', 15]]
    }),
    methods: {
      filterReg (arr) {
        let reg = this.registries.map(r => r.name);
        return arr.filter(d => reg.includes(d[0]))
      }
    }
  }
</script>
