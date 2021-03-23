<template>
    <div>
      <v-menu 
        v-if="$vuetify.breakpoint.mobile"
        :close-on-content-click="false"
        >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            class="mb-4"
            fab
            small
            color="primary"
          >
            <v-icon>
              mdi-cog
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="text-body-1">
            Controls
          </v-card-title>
          <v-card-text>
            <v-switch class="mt-3 mr-3" label="Show counts" v-model="count" @click="showClicked">
            </v-switch>
            <v-select
            style="max-width: 15rem"
              :items="filterKeys"
              v-model="selectedFilt"
              @input="selected"
              multiple
            >
              <template v-slot:prepend-item>
                  <v-list-item>
                      <v-list-item-action>
                          <v-checkbox @change="selectAll"></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-title>
                          Select all
                      </v-list-item-title>
                  </v-list-item>
              </template>
              <template v-slot:selection="{ item, index}">
                <v-chip v-if="index === 0">
                  <span> {{item}}</span>
                </v-chip>
                <span
                  v-if="index === 1"
                  class="grey--text caption"
                >
                  (+{{ filter.length - 1 }})
                </span>
              </template>
            </v-select>
        </v-card-text>
        </v-card>
        </v-menu>
        <v-row v-if="!($vuetify.breakpoint.mobile)">
          <v-switch class="mt-3 mr-3" label="Show counts" v-model="count" @click="showClicked">
          </v-switch>
          <v-select
          style="max-width: 15rem"
            :items="filterKeys"
            v-model="selectedFilt"
            @input="selected"
            multiple
          >
            <template v-slot:prepend-item>
                <v-list-item>
                    <v-list-item-action>
                        <v-checkbox @change="selectAll"></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-title>
                        Select all
                    </v-list-item-title>
                </v-list-item>
            </template>
            <template v-slot:selection="{ item, index}">
              <v-chip v-if="index === 0">
                <span> {{item}}</span>
              </v-chip>
              <span
                v-if="index === 1"
                class="grey--text caption"
              >
                (+{{ filter.length - 1 }})
              </span>
            </template>
          </v-select>
        </v-row>
    </div>
</template>

<script>
export default {
 name: "fieldValueGraphControls",
 props: {
     filterKeys: Array,
     filter: Array,
     showCounts: Boolean
 },
 data () {
     return {
         count: this.showCounts,
         selectedFilt: this.filterKeys,
     }
 },
 methods: {
    showClicked () {
        this.$emit("countClick", this.count)        
    },
    selected() {
        this.$emit("filtered", this.selectedFilt)
    },
    selectAll(state) {
        if (state) {
            this.selectedFilt = this.filterKeys
        } else {
            this.selectedFilt = []
        }
        this.selected()
    }
 }
}
</script>

<style>

</style>