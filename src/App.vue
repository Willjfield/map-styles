<script setup lang="ts">
import MapView from './components/MapView.vue'
</script>

<template>
  <v-app class="fill-viewport">
    <v-main class="pa-0 fill-viewport">
      <MapView />
    </v-main>
  </v-app>
</template>

<style scoped>
.fill-viewport {
  height: 100%;
  min-height: 100%;
}
</style>
