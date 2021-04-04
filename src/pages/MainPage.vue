<template>
  <v-container>
    <v-row>
      <v-col>
        <!-- Start of graphs -->
        <Widget subtitle="Percentage of duplicated entries" :id=0 @expand="maximise" title="Uniqueness" :loading="loading">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Uniqueness')">Uniqueness</a>
          </template>
          <column-chart label="Percentage of duplicated data" :library="config.zoomAndPan" suffix="%" :data="filterReg(unique)" :download="true"></column-chart>
        </Widget>
      </v-col>
      <v-col>
        <Widget subtitle="Percentage of empty or missing datapoints across all registires" :id=1 @expand="maximise" title="Completeness" :loading="loading">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Completeness')">Completeness</a>
            </template>
            <column-chart label="Percentage of missing data" :library="config.zoomAndPan" suffix="%" :data="filterReg(complete)" :download="true"></column-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrect values" :id=2 @expand="maximise" title="Correctness" :loading="loading">
            <template v-slot:title>
              <a style="color:black" @click="navigate('Correctness')">Correctness</a>
            </template>
            <bar-chart label="Percentage of incorrect data" :library="config.zoomAndPan" suffix="%" :data="filterReg(correct)" :download="true"></bar-chart>
        </Widget>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <Widget subtitle="Percentage of incorrectly formatted data" :id=3 @expand="maximise" title="Consistency" :loading="loading">
          <template v-slot:title>
            <a style="color:black" @click="navigate('Consistency')">Consistency</a>
          </template>
          <column-chart label="Inconsistent data" :library="config.zoomAndPan" :data="filterReg(consistent)" :download="true" suffix="%"></column-chart>
        </Widget>
      </v-col>
      <!-- End of graphs -->
      <!-- Start of expansion dialog -->
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
          <column-chart v-if="maximised.id == 0" label="Percentage of duplicated data" :library="config.zoomAndPan" suffix="%" :data="filterReg(unique)" :download="true" height="70vh" ></column-chart>
          <column-chart v-if="maximised.id == 1" label="Percentage of missing data" :library="config.zoomAndPan" :data="filterReg(complete)" :download="true" height="70vh" ></column-chart>
          <bar-chart v-if="maximised.id == 2" label="Percentage of incorrect data" :library="config.zoomAndPan" suffix="%" :data="filterReg(correct)" :download="true" height="70vh" ></bar-chart>
          <column-chart v-if="maximised.id == 3" label="Inconsistent data" :library="config.zoomAndPan" :data="filterReg(consistent)" :download="true" height="70vh" ></column-chart>
        <v-divider/>
          <v-card-actions>
            <v-btn color="success" class="ml-auto" @click="dialog=false">Close</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <!-- End of expansion dialog -->
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
      set: Object,
      counts: Object
    },
    data: () => ({
      unique: [],
      complete: [],
      correct: [],
      consistent: [],
      retry: false,
      dialog: false,
      maximised: {},
      config,
      loading: false
    }),
    mounted() {
      this.getData()
    },
    watch: {
      set() {
        this.getData()
      }
    },
    methods: {
      /**
       * @description Handler for deciding which widget to maximise in the page
       * @param {{
       * id: number, 
       * name: string, 
       * subtitle: string
       * }} toMaximise Object for referencing the correct graph to inject into the maximisation dialog
       */
      maximise(toMaximise) {
        this.maximised = toMaximise
        this.dialog = true
      },
      /**
       * @description Handler function for filtering the displayed registries
       * @param {{
       *  id: number, 
       *  Registry: string, 
       *  selected: boolean,
       *  color: string
       * }[]} arr Array containing registry object information
       */
      filterReg (arr) {
        let reg = this.registries.filter(r => r.selected).map(r => r.Registry);
        return arr.filter(d => reg.includes(d[0]))
      },
      /**
       * @async
       * @description Async fetch for all metric data in provided registries
       */
      async getData() {
        try {
          this.loading = true
          let promises = ['unique', 'complete', 'consistency', 'correct']
          promises = promises.map(e => this.axios.get(`${config.apiURL}/metrics/totals/${e}?registries=${this.registries.map(e => e.Registry).join(',')}&set=${this.set.path}`, 
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

          if (this.retry === false) {
            this.retry = true
            await this.getData()
          }
          this.loading = false
        } catch (e) {
          if (!this.retry) {
            this.getData()
            this.retry = true
          }
          this.error()
          console.log(e)
        }
      },
      /**
       * @description Generic error triggering function for providing snack trigger to App.vue
       */
      error() {
        this.loading = false
        this.$emit("error", 
        { 
          text: "There was an error getting data for this set",
          state: true,
          color: "error"  
        })
      },
      /**
       * @description Navigation event emitter
       * @param {{
       * 
       * }} page Page to trigger navigation to
       */
      navigate(page) {
        this.$emit("navigate", page)
      },
      /**
       * @description Data format handler for preparing object data for graphs
       * @param {{
       *  registry: number
       * }} data Registry data object as returned by the API
       */
      formatData(data) {
        return Object.keys(data).map(e => (
          [e, data[e]]
        ))
      }
    }
  }
</script>
