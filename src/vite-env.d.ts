/// <reference types="vite/client" />

declare module 'vuetify/styles'

declare module '*.frag?raw' {
  const source: string
  export default source
}
