import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/global-colors.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

import App from './App.vue'
import { useUserStore } from './stores/user'

// 设置axios默认配置 - 开发模式使用Vite代理，生产模式使用空baseURL
const isDev = process.env.NODE_ENV === 'development'
axios.defaults.baseURL = isDev ? '' : '' // 开发模式使用相对路径通过Vite代理
axios.defaults.timeout = 60000 // 增加超时时间

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(pinia)

// 初始化用户认证状态
const userStore = useUserStore()
userStore.initAuth().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('初始化用户状态失败:', error)
  app.mount('#app')
})