// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useTabStore } from './stores/tab'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

