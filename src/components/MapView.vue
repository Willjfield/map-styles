<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLike } from '../postprocessing'

import {
  MAP_STYLES,
  styleById,
  styleJsonUrl,
  styleTransformForFolder,
  type MapStyleDefinition,
} from '../config/mapStyles'
import {
  applyPostprocessingPreset,
  createMapShaderPlugin,
} from '../shaders'

const plugin = createMapShaderPlugin(MAP_STYLES[0]?.id ?? '')

const mapContainer = ref<HTMLDivElement | null>(null)
const selectedId = ref<string>(MAP_STYLES[0]?.id ?? '')
let map: maplibregl.Map | null = null

function applyCamera(def: MapStyleDefinition) {
  if (!map) return
  map.flyTo({
    center: def.center,
    zoom: def.zoom,
    essential: true,
  })
}

function loadStyle(def: MapStyleDefinition) {
  if (!map) return
  const url = styleJsonUrl(def.publicFolder)

  map.setStyle(url, {
    transformStyle: styleTransformForFolder(def.publicFolder),
  })
  map.once('style.load', () => applyCamera(def))
}

function syncPostprocessingToStyle(styleId: string) {
  applyPostprocessingPreset(plugin, styleId)
}

onMounted(() => {
  const el = mapContainer.value
  const initial = styleById(selectedId.value) ?? MAP_STYLES[0]
  if (!el || !initial) return

  map = new maplibregl.Map({
    container: el,
    center: initial.center,
    zoom: initial.zoom,
    hash: true,
  })

  syncPostprocessingToStyle(initial.id)

  map.once('load', () => {
    if (map) plugin.attach(map as unknown as MapLike)
  })

  map.setStyle(styleJsonUrl(initial.publicFolder), {
    transformStyle: styleTransformForFolder(initial.publicFolder),
  })
})

watch(selectedId, (id) => {
  const def = styleById(id)
  if (!def || !map) return
  syncPostprocessingToStyle(id)
  loadStyle(def)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="map-shell">
    <div class="style-bar">
      <v-select
        v-model="selectedId"
        :items="[...MAP_STYLES]"
        item-title="label"
        item-value="id"
        label="Map style"
        density="compact"
        hide-details
        variant="solo-filled"
        class="style-select"
      />
    </div>
    <div ref="mapContainer" class="map" />
  </div>
</template>

<style scoped>
.map-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.style-bar {
  position: absolute;
  z-index: 1;
  top: 12px;
  left: 12px;
  right: 12px;
  max-width: 320px;
  pointer-events: auto;
}

.style-select {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
}

.map {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
