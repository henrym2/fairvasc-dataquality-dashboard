<template>
    <div>
        <v-menu
            :close-on-content-click="false"
            max-width="25vw"
        >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                class="mb-4"
                fab
                small
                elevation="1"
                color="primary"
              >
                <v-icon>
                    mdi-cog
                </v-icon>
              </v-btn>
            </template>
            <v-card
                width="25vw"
            >
                <v-card-title class="text-body-2">
                    Choose a range
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <v-menu
                                :close-on-content-click="false"
                                z-index="1003"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        class="m-1"
                                        v-model="startDate"
                                        v-bind="attrs"
                                        v-on="on"
                                        label="Start"
                                        readonly
                                    >
                                    </v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="startDate"
                                    @change="datesChanged"
                                    no-title
                                    scrollable
                                    width="25em"
                                    :events="events.map(e => new Date(e.date).toISOString().substr(0,10))"
                                >
                                </v-date-picker>
                            </v-menu>
                            <v-menu
                                :close-on-content-click="false"
                                z-index="1003"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        class="m-1"
                                        v-model="endDate"
                                        v-bind="attrs"
                                        v-on="on"
                                        label="End"
                                        readonly
                                    >
                                    </v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="endDate"
                                    @change="datesChanged"
                                    no-title
                                    scrollable
                                    width="25em"
                                    :events="events.map(e => new Date(e.date).toISOString().substr(0,10))"
                                >
                                </v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-menu>
    </div>
</template>

<script>
/**
 * @description Range selector for two time periods
 * @param {string} beginning initial start date
 * @param {string} end Initial end date
 * @param {{
 *  date: Date,
 *  path: string
 *  name: string
 * }[]} events Array of entry objects for tagging events on date selectors. 
 */
export default {
    props: {
        beginning: String,
        end: String,
        events: Array
    },
    data () {
        return {
            startDate: this.beginning || new Date().toISOString().substr(0,10),
            endDate: this.end || new Date().toISOString().substr(0,10)
        }
    },
    methods: {
        /**
            @description Callback function triggered whenever the start or end dates change
            @returns {(Date, Date)}
         */
        datesChanged () {
            this.$emit("rangeChange", new Date(this.startDate), new Date(this.endDate))
        }
    }

}
</script>

<style>

</style>