<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Total missing" subtitle="Total percentage missing">
            <pie-chart :data="filterReg(total)" :legend="true" :colors="registries.map(r => r.color)" suffix="%"></pie-chart>
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
            <column-chart :data="[['Sun', 32], ['Mon', 46], ['Tue', 28]]"></column-chart>
        </Widget>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Widget from "../components/Widget.vue"

  export default {
    name: 'Completeness',
    components: {
      Widget
    },
    props: {
      registries: Array
    },
    data: () => ({
      total: [['Dublin', 44], ['Lund', 23], ['Poland', 10], ['France', 17]]
    }),
    methods: {
      filterReg (arr) {
        let reg = this.registries.map(r => r.name);
        return arr.filter(d => reg.includes(d[0]))
      }
    }
  }
</script>
