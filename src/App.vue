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
      <v-list-group
        :value="true"
        @click.stop
      >
        <template v-slot:activator>
          <v-list-item-icon><v-icon>account_balance</v-icon></v-list-item-icon>
          <v-list-item-title>Registries</v-list-item-title>
          <v-list-item-action></v-list-item-action>
        </template>
        <v-list-item v-for="registry in registryList" :key="registry.id">
          <v-list-item-title>{{registry.name}}</v-list-item-title>
          <v-list-item-action><v-checkbox v-model="registry.selected"></v-checkbox></v-list-item-action>
        </v-list-item>
      </v-list-group>

      <v-divider></v-divider>

      <v-list-group
        :value="true"
        @click.stop
      >
        <template v-slot:activator>
          <v-list-item-icon><v-icon>insights</v-icon></v-list-item-icon>
          <v-list-item-title>Metrics</v-list-item-title>
        </template>
        
        <v-list-item v-for="metric in metricsList" :key="metric.id" @click="changePage(metric.id)">
          <v-list-item-icon><v-icon>{{metric.icon}}</v-icon></v-list-item-icon>
          <v-list-item-title>{{metric.name}}</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <v-divider></v-divider>
    </v-list>

    </v-navigation-drawer>
    

    <v-main>
      
      <MainPage/>
      
    </v-main>
  </v-app>
</template>

<script>
import MainPage from './components/MainPage.vue';

export default {
  name: 'App',

  components: {
    MainPage,
  },

  data: () => ({
    drawer: true,
    registryList: [
      {id: 0, name: "Dublin", selected: false},
      {id: 1, name: "Skáné", selected: false},
      {id: 2, name: "Poland", selected: false}
    ],
    metricsList: [
      {id: 0, name: "Uniqueness", icon: "fingerprint"},
      {id: 1, name: "Consistency", icon: "panorama_fish_eye"},
      {id: 2, name: "Completeness", icon: "assignment"},
      {id: 3, name: "Correctness", icon: "check_circle"}
    ]
  }),

  methods: {
    changePage(id) {
      alert(id)
    }
  }
};
</script>
