<template>
    <v-card>
        <!-- <v-card-title>{{title}}</v-card-title>
        <v-card-subtitle>{{subtitle}}</v-card-subtitle> -->
        <v-toolbar flat>
            <v-toolbar-title>{{title}}</v-toolbar-title>
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
        "subtitle": String
    }

}
</script>

<style>

</style>