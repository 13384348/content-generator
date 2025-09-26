import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/global-colors.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

import App from './App.vue'

// 设置axios默认配置 - 自动检测环境
const isDev = process.env.NODE_ENV === 'development'
axios.defaults.baseURL = isDev ? 'http://localhost:5004' : ''
axios.defaults.timeout = 10000

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(pinia)
app.mount('#app')