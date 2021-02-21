<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      hide-on-scroll
    >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title>FAIRVASC Data Quality Dashboard</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
    <v-list>
      <v-list-item @click="changePage(-1)">
        <v-list-item-icon><v-icon>home</v-icon></v-list-item-icon>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
        <v-list-item>
          <v-list-item-title class="text-subtitle-1 text--secondary">Registries</v-list-item-title>
          <v-list-item-action>
            <v-icon v-if="!multi" @click.stop="selectAll(true)">check_box_outline_blank</v-icon>
            <v-icon v-if="multi" @click.stop="selectAll(false)">indeterminate_check_box</v-icon>
          </v-list-item-action>
        </v-list-item>

        <v-list-item v-for="item in registryList" :key="`registry-${item.id}`" :value="item" ripple @click="item.selected = !item.selected">
            <v-list-item-content>
              <v-list-item-title v-text="item.Registry"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox
                :input-value="item.selected"
              ></v-checkbox>
            </v-list-item-action>
        </v-list-item>

      <v-divider></v-divider>
      <v-expansion-panels
        accordion
        hover
        :value="[0]"
        flat
        multiple
        style="width:15.9rem;padding:0vw"
      >
      <v-expansion-panel
        class="p-n1"
      >
        <v-expansion-panel-header>
          Metrics
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list-item class="p-0" v-for="metric in metricsList" :key="metric.id" @click.stop="changePage(metric.id)">
            <v-list-item-title>{{metric.name}}</v-list-item-title>
            <v-list-item-icon><v-icon>{{metric.icon}}</v-icon></v-list-item-icon>

          </v-list-item>
        </v-expansion-panel-content>
      </v-expansion-panel>
      </v-expansion-panels>
      <v-divider></v-divider>

    </v-list>

    </v-navigation-drawer>
    
    <v-main>
        <main-page v-if="currentPage == -1" :registries="registryList || []" ></main-page>
        <uniqueness v-if="currentPage == 0" :registries="registryList || []"></uniqueness>
        <consistency v-if="currentPage == 1" :registries="registryList || []"></consistency>
        <completeness v-if="currentPage == 2" :registries="registryList || []"></completeness>
        <correctness v-if="currentPage == 3" :registries="registryList || []"></correctness>
    </v-main>
  </v-app>
</template>

<script>
import Pages from './pages/pages.js'
import config from "./config.js"
var randomColor = () => Math.floor(Math.random()*16777215).toString(16);
export default {
  name: 'App',

  components: Pages,

  data: () => ({
    drawer: true,
    registryList: [

    ],
    metricsList: [
      {id: 0, name: "Uniqueness", icon: "fingerprint",},
      {id: 1, name: "Consistency", icon: "panorama_fish_eye"},
      {id: 2, name: "Completeness", icon: "assignment"},
      {id: 3, name: "Correctness", icon: "check_circle"}
    ],
    currentPage: -1,
    multi: false
  }),
  computed: {
    pages() {
      return [{id: -1, name: "Main Page"}, ...this.metricsList]
    },
  },
  created() {
    this.getRegistries()
  },
  watch: {
    registryList: {
      deep: true,
      handler(oldVal) {
        this.multi = oldVal.some(val => val.selected)
      }
    }
  },

  methods: {
    changePage(id) {
      this.currentPage = id
    },
    selectAll(choice) {
      this.registryList = this.registryList.map(reg => ({
        ...reg,
        selected: choice
      }))
    },
    async getRegistries() {
      let { data }  = await this.axios.get(`${config.apiURL}/registries`)
      this.registryList = data.map((e,i) => ({
        id: i, Registry: e, selected: true, color: String(randomColor())
      }))
    }
  }
};
</script>
<style lang="sass">

</style>