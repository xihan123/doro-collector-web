import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useStickerInteractionStore } from './store/stickerInteractionStore'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

const app = createApp(App)

app.use(pinia)
app.use(router)

useStickerInteractionStore().initUserInteractions()

app.mount('#app')
