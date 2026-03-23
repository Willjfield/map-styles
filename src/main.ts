import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import App from './App.vue'

const vuetify = createVuetify()

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
