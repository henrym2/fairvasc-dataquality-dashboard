<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget title="Line Graph" subtitle="Time">
          <line-chart :data="{'2017-05-13': 2, '2017-05-14': 5}" :download="true"></line-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget title="Pie Chart" subtitle="Berries">
            <pie-chart :data="[['Blueberry', 44], ['Strawberry', 23]]" :download="true"></pie-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Bar Graph" subtitle="Graph">
            <column-chart :data="[['Sun', 32], ['Mon', 46], ['Tue', 28]]" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget title="Area Graph">
          <line-chart :data="[{name: 'Broken', data: {'a':1, 'b':4, 'c':2}},{name: 'Fixed', data: {'a':1, 'b':3, 'c':5}}]"></line-chart>
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
    data: () => ({
      
    }),
  }
</script>
