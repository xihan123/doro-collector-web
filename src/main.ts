import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 确保这行正确引入
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入瀑布流组件
import MasonryWall from '@yeger/vue-masonry-wall'
import { useStickerStore } from './store/stickerStore'

// 创建应用
const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
// 全局注册瀑布流组件
app.use(MasonryWall)

// 初始化用户交互状态
const stickerStore = useStickerStore()
stickerStore.initUserInteractions()

app.mount('#app')