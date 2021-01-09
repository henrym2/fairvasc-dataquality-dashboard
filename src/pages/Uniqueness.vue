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
            <pie-chart :data="[['Blueberry', 44], ['Strawberry', 23]]"></pie-chart>
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
    name: 'Uniqueness',
    components: {
      Widget
    },
    props: {
      registries: Array
    },
    data: () => ({
      
    }),
  }
</script>
