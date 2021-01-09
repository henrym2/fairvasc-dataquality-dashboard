<template>
    <v-card
        elevation="4"
    >
        <v-toolbar flat>
            <v-toolbar-title>
                <v-card-title>
                    {{title}}
                </v-card-title>
                <v-card-subtitle>
                    {{subtitle}}
                </v-card-subtitle>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-icon color="primary" @click="expand">open_in_full</v-icon>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
            <slot></slot>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "Widget",
    props: {
        "title": String,
        "subtitle": String,
        "id": Number
    },
    methods: {
        expand() {
            this.$emit("expand")
        }
    }

}
</script>

<style>

</style>