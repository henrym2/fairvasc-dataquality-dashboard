<template>
  <v-container>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of duplicated entries" :id=0 @expand="maximise" title="Uniqueness">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Uniqueness')">Uniqueness</a>
          </template>
          <column-chart label="Percentage of duplicated data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" suffix="%" :data="filterReg(unique)" :download="true"></column-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget subtitle="Percentage of empty or missing datapoints across all registires" :id=1 @expand="maximise" title="Completeness">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Completeness')">Completeness</a>
            </template>
            <column-chart label="Percentage of missing data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" suffix="%" :data="filterReg(complete)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrect values" :id=2 @expand="maximise" title="Correctness">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Correctness')">Correctness</a>
            </template>
            <bar-chart label="Percentage of incorrect data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" suffix="%" :data="filterReg(correct)" :download="true"></bar-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrectly formatted data" :id=3 @expand="maximise" title="Consistency">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Consistency')">Consistency</a>
          </template>
          <column-chart label="Inconsistent data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" :data="filterReg(consistent)" :download="true"></column-chart>
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
            <column-chart v-if="maximised.id == 0" label="Percentage of duplicated data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" suffix="%" :data="filterReg(unique)" :download="true"></column-chart>
            <column-chart v-if="maximised.id == 1" label="Percentage of missing data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" :data="filterReg(complete)" :download="true"></column-chart>
            <bar-chart v-if="maximised.id == 2" label="Percentage of incorrect data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" suffix="%" :data="filterReg(correct)" :download="true"></bar-chart>
            <column-chart v-if="maximised.id == 3" label="Inconsistent data" :colors="[registries.map(r => `#${r.color.toUpperCase()}`)]" :data="filterReg(consistent)" :download="true"></column-chart>
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

  export default {
    name: 'mainPage',
    components: {
      Widget
    },
    props: {
      registries: Array,
      pages: Array,
      set: Object
    },
    data: () => ({
      unique: [],
      complete: [],
      correct: [],
      consistent: [],
      retry: false,
      dialog: false,
      maximised: {}
    }),
    mounted() {
      this.getData()
    },
    methods: {
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
      },
      filterReg (arr) {
        let reg = this.registries.filter(r => r.selected).map(r => r.Registry);
        return arr.filter(d => reg.includes(d[0]))
      },
      async getData() {
        try {
          let promises = ['unique', 'complete', 'consistency', 'correct']
          promises = promises.map(e => this.axios.post(`${config.apiURL}/totals/${e}`, 
            {
              registries: this.registries.map(e => e.Registry),
              set: this.set
            }
          ))
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
