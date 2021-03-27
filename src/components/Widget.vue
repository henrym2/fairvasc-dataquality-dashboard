<template>
    <v-card
        elevation="4"
        :loading="loading"
    >
        <v-toolbar flat>
            <v-toolbar-title>
                <v-card-title>
                    <slot name="title">
                        
                    </slot>
                    <div v-if="!(!!$slots.title)">
                    {{title}}
                    </div>
                </v-card-title>
                <v-card-subtitle>
                    {{subtitle}}
                </v-card-subtitle>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <div class="mt-4 mr-1">
                <slot class="mt-3" name="controls">
                </slot>
            </div>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs } ">
                    <v-icon
                        v-bind="attrs"
                        v-on="on" 
                        color="primary" 
                        @click="expand"
                        class="ml-5"
                    >open_in_full</v-icon>
                </template>
                <span>Click to expand</span>
            </v-tooltip>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <slot></slot>
        </v-card-text>
    </v-card>
</template>

<script>
/**
    @param {string} title The title of the Widget
    @param {string} subtitle Subtitle for the widget
    @param {number} id Id for the widget for when handling expansion panels
    @param {boolean} loading Param for telling the card to go into loading mode or not 
 */
export default {
    name: "Widget",
    props: {
        "title": String,
        "subtitle": String,
        "id": Number,
        "loading": Boolean
    },
    methods: {
        /**
        @description Called in order to trigger the expand event
        @returns {{
            id: number,
            title: string,
            subtitle: string
        }}
         */
        expand() {
            this.$emit("expand", {id: this.id, name: this.title, subtitle: this.subtitle})
        }
    }

}
</script>

<style>

</style>