<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      hide-on-scroll
    >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title>FAIRVASC Quality Dashboard</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
    <v-list>
      <v-list-item>
        <v-list-item-title>FAIRVASC Quality Dashboard</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
        <v-list-item>
          <v-list-item-title>Registries</v-list-item-title>
        </v-list-item>

        <v-list-item v-for="item in registryList" :key="`registry-${item.id}`" :value="item" ripple @click="item.selected = !item.selected">
            <v-list-item-action>
              <v-checkbox
                :input-value="item.selected"
              ></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
            </v-list-item-content>
        </v-list-item>

      <v-divider></v-divider>
      <v-expansion-panels
        accordion
        hover
        :value="[0]"
        flat
        multiple
      >
      <v-expansion-panel>
        <v-expansion-panel-header>
          Metrics
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list-item v-for="metric in metricsList" :key="metric.id" @click.stop="changePage(metric.id)">
            <v-list-item-icon><v-icon>{{metric.icon}}</v-icon></v-list-item-icon>
            <v-list-item-title>{{metric.name}}</v-list-item-title>
          </v-list-item>
        </v-expansion-panel-content>
      </v-expansion-panel>
      </v-expansion-panels>
      <v-divider></v-divider>

    </v-list>

    </v-navigation-drawer>
    

    <v-main>
        <main-page v-if="currentPage == -1"></main-page>
        <uniqueness v-if="currentPage == 0"></uniqueness>
        <consistency v-if="currentPage == 1"></consistency>
        <completeness v-if="currentPage == 2"></completeness>
        <correctness v-if="currentPage == 3"></correctness>
    </v-main>
  </v-app>
</template>

<script>
import Pages from './pages/pages.js'

export default {
  name: 'App',

  components: Pages,

  data: () => ({
    drawer: true,
    registryList: [
      {id: 0, name: "Dublin", selected: false},
      {id: 1, name: "Skáné", selected: false},
      {id: 2, name: "Poland", selected: false},
    ],
    selectedRegistires: [],
    metricsList: [
      {id: 0, name: "Uniqueness", icon: "fingerprint"},
      {id: 1, name: "Consistency", icon: "panorama_fish_eye"},
      {id: 2, name: "Completeness", icon: "assignment"},
      {id: 3, name: "Correctness", icon: "check_circle"}
    ],
    currentPage: -1
  }),
  computed: {
    pages() {
      return [{id: -1, name: "Main Page"}, ...this.metricsList]
      }
  },

  methods: {
    changePage(id) {
      this.currentPage = id
    }
  }
};
</script>
