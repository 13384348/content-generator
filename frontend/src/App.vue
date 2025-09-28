<template>
  <div id="app">

    <!-- 大脑思维界面 -->
    <div class="brain-container" :class="{
      'layout-content': layoutMode === 'content',
      'transitioning': isTransitioning
    }">
      <!-- 中央机器人图形 -->
      <div class="brain-center" @click="layoutMode === 'content' ? returnToHome() : null" :title="layoutMode === 'content' ? '返回首页' : 'AI内容生成助手'">
        <!-- 机器人图片 -->
        <div class="robot-container">
          <img src="@/assets/robot.png" alt="AI Robot" class="robot-body" />
          <img src="@/assets/robot.png" alt="AI Robot Head" class="robot-head" />
        </div>
        <!-- 机器人对话气泡 -->
        <div class="robot-speech-bubble" v-if="layoutMode === 'content'">
          点我返回
        </div>

        <!-- 保留连接线的SVG容器 -->
        <svg class="connection-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <!-- 机器人到气泡的连接线 -->
          <g class="brain-to-bubble-connections">
            <!-- 连接到气泡1 -->
            <path class="connection-line connection-1" d="M160 110 Q 100 50, 60 40" stroke-dasharray="2,3"/>
            <!-- 连接到气泡2 -->
            <path class="connection-line connection-2" d="M240 110 Q 300 50, 340 40" stroke-dasharray="2,3"/>
            <!-- 连接到气泡3 -->
            <path class="connection-line connection-3" d="M240 190 Q 300 250, 340 260" stroke-dasharray="2,3"/>
            <!-- 连接到气泡4 -->
            <path class="connection-line connection-4" d="M160 190 Q 100 250, 60 260" stroke-dasharray="2,3"/>
            <!-- 连接到气泡5 -->
            <path class="connection-line connection-5" d="M140 150 Q 80 120, 40 140" stroke-dasharray="2,3"/>
            <!-- 连接到气泡6 -->
            <path class="connection-line connection-6" d="M260 150 Q 320 120, 360 140" stroke-dasharray="2,3"/>
            <!-- 连接到气泡5 -->
            <path class="connection-line connection-5" d="M140 150 Q 80 120, 40 140" stroke-dasharray="2,3"/>
            <!-- 连接到气泡7 -->
            <path class="connection-line connection-7" d="M200 190 Q 200 250, 200 280" stroke-dasharray="2,3"/>
          </g>

          <!-- 思考脉冲点 -->
          <g class="thinking-nodes">
            <circle class="pulse-node" cx="120" cy="120" r="3"/>
            <circle class="pulse-node" cx="280" cy="120" r="3"/>
            <circle class="pulse-node" cx="150" cy="170" r="3"/>
            <circle class="pulse-node" cx="250" cy="170" r="3"/>
            <circle class="pulse-node" cx="200" cy="100" r="3"/>
          </g>
        </svg>

        <!-- 大脑中心标题 -->
        <div class="brain-title">
          <h1>萌太奇自媒体运营小弟</h1>
          <p>萌太奇自媒体运营小弟</p>
        </div>
      </div>

      <!-- 思维粒子效果 -->
      <div class="thinking-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
      </div>

      <!-- 点击波纹效果 -->
      <div class="thinking-ripple" v-if="activeFeature" key="ripple"></div>

      <!-- 浮动气泡导航 -->
      <div class="bubble-navigation">
        <!-- 内容生成气泡 -->
        <div class="bubble bubble-1" @click="selectFeature('content')" :class="{ active: activeFeature === 'content' }" :title="'小萌爆款文案大师 - 一键生成选题-钩子-爆款文案-分镜脚本'">
          <el-icon class="bubble-icon"><DocumentCopy /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">小萌爆款文案大师</span>
            <span class="bubble-desc">一键生成选题-钩子-爆款文案-分镜脚本</span>
          </div>
        </div>

        <!-- 二创工具气泡 -->
        <div class="bubble bubble-2" @click="selectFeature('recreation')" :class="{ active: activeFeature === 'recreation' }" :title="'爆款二创 - 根据提供的文案进行二次专属创作'">
          <el-icon class="bubble-icon"><RefreshRight /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">爆款二创</span>
            <span class="bubble-desc">根据提供的文案进行二次专属创作</span>
          </div>
        </div>

        <!-- 分镜脚本气泡 -->
        <div class="bubble bubble-3" @click="selectFeature('storyboard')" :class="{ active: activeFeature === 'storyboard' }" :title="'分镜脚本 - 根据文案内容生成详细拍摄镜头脚本'">
          <el-icon class="bubble-icon"><VideoCamera /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">分镜脚本</span>
            <span class="bubble-desc">根据文案内容生成详细拍摄镜头脚本</span>
          </div>
        </div>

        <!-- 收藏夹气泡 -->
        <div class="bubble bubble-4" @click="selectFeature('favorites')" :class="{ active: activeFeature === 'favorites' }" :title="'我的收藏 - 生成内容不浪费，收藏下来可多次使用'">
          <el-icon class="bubble-icon"><Star /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">我的收藏</span>
            <span class="bubble-desc">生成内容不浪费，收藏下来可多次使用</span>
          </div>
        </div>

        <!-- 对标账号拆解气泡 -->
        <div class="bubble bubble-5" @click="handleComingSoon('对标账号拆解')" :title="'对标账号拆解 - 一键扒取对标帐号内容'">
          <el-icon class="bubble-icon"><DocumentCopy /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">对标账号拆解</span>
            <span class="bubble-desc">一键扒取对标帐号内容（即将推出）</span>
          </div>
        </div>

        <!-- 视频提取文字气泡 -->
        <div class="bubble bubble-6" @click="handleComingSoon('视频提取文字')" :title="'视频提取文字 - 一键提取视频文字'">
          <el-icon class="bubble-icon"><VideoCamera /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">视频提取文字</span>
            <span class="bubble-desc">一键提取视频文字（即将推出）</span>
          </div>
        </div>

        <!-- 人设IP打造气泡 -->
        <div class="bubble bubble-7" @click="handleComingSoon('人设IP打造')" :title="'人设IP打造 - 生成人设个性化爆款内容'">
          <el-icon class="bubble-icon"><User /></el-icon>
          <div class="bubble-text">
            <span class="bubble-title">人设IP打造</span>
            <span class="bubble-desc">生成人设个性化爆款内容（即将推出）</span>
          </div>
        </div>

      </div>

      <!-- 用户界面区域 -->
      <div class="user-interface" :class="{ 'layout-content': layoutMode === 'content' }">
        <!-- 剩余使用次数显示 -->
        <div class="usage-counter">
          <el-icon class="usage-icon"><Star /></el-icon>
          <span class="usage-text">剩余 {{ userStore.getRemainingUsage }} 次</span>
        </div>

        <!-- 管理后台按钮 - 仅管理员可见 -->
        <div v-if="userStore.isAdmin" class="admin-section">
          <el-button
            type="warning"
            size="small"
            @click="selectFeature('admin')"
            class="admin-btn"
          >
            <el-icon><Setting /></el-icon>
            管理后台
          </el-button>
        </div>

        <!-- 用户头像/登录按钮 -->
        <div class="user-avatar-section" v-if="userStore.isLoggedIn">
          <div class="user-info-wrapper" @click="handleShowUserCenter">
            <el-avatar
              :size="32"
              :icon="User"
              class="user-avatar"
            />
            <span class="user-name">用户中心</span>
          </div>
        </div>
        <div class="login-section" v-else>
          <el-button
            type="primary"
            size="small"
            @click="handleShowAuth('login')"
            class="login-btn"
          >
            登录
          </el-button>
          <el-button
            size="small"
            @click="handleShowAuth('register')"
            class="register-btn"
          >
            注册
          </el-button>
        </div>
      </div>

      <!-- 全屏内容展示区域 -->
      <div class="fullscreen-content" v-if="layoutMode === 'content'">
        <div class="content-main">
          <component :is="getActiveComponent()" v-if="activeFeature" />
        </div>
      </div>

    </div>

    <!-- 关于萌太奇按钮 -->
    <div class="about-button">
      <el-button
        @click="showAboutDialog = true"
        class="about-btn"
        type="info"
        size="small"
      >
        <el-icon><InfoFilled /></el-icon>
        关于萌太奇
      </el-button>
    </div>

    <!-- 认证对话框 -->
    <AuthDialog
      v-model="showAuthDialog"
      :default-mode="authMode"
      @success="handleAuthSuccess"
      @show-auth="handleShowAuth"
    />


    <!-- 用户中心对话框 -->
    <UserCenter
      v-model="showUserCenter"
      @show-auth="handleShowAuth"
      @show-purchase="handleShowPurchase"
      @show-subscription="handleShowSubscription"
    />

    <!-- 使用限制对话框 -->
    <UsageLimitDialog
      v-model="showUsageLimitDialog"
      :usage-info="currentUsageInfo"
      @register="handleUsageLimitRegister"
      @purchase="handleUsageLimitPurchase"
      @subscribe="handleUsageLimitSubscribe"
    />

    <!-- 购买对话框 -->
    <PurchaseDialog
      v-model="showPurchaseDialog"
      @success="handlePurchaseSuccess"
    />

    <!-- 订阅对话框 -->
    <SubscriptionDialog
      v-model="showSubscriptionDialog"
      @success="handleSubscriptionSuccess"
    />

    <!-- 关于萌太奇对话框 -->
    <AboutDialog
      v-model="showAboutDialog"
      :content="aboutContent"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ContentGenerator from './views/ContentGenerator.vue'
import ExplosiveContentRecreation from './views/ExplosiveContentRecreation.vue'
import Storyboard from './views/Storyboard.vue'
import MyFavorites from './views/MyFavorites.vue'
import Admin from './views/Admin.vue'
import AuthDialog from './components/AuthDialog.vue'
import AboutDialog from './components/AboutDialog.vue'
import UserCenter from './components/UserCenter.vue'
import UsageLimitDialog from './components/UsageLimitDialog.vue'
import PurchaseDialog from './components/PurchaseDialog.vue'
import SubscriptionDialog from './components/SubscriptionDialog.vue'
import { useUserStore } from './stores/user.js'
import { DocumentCopy, RefreshRight, VideoCamera, Star, Setting, User, InfoFilled } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    ContentGenerator,
    ExplosiveContentRecreation,
    Storyboard,
    MyFavorites,
    Admin,
    AuthDialog,
    AboutDialog,
    UserCenter,
    UsageLimitDialog,
    PurchaseDialog,
    SubscriptionDialog,
    DocumentCopy,
    RefreshRight,
    VideoCamera,
    Star,
    Setting,
    User,
    InfoFilled
  },
  setup() {
    const activeFeature = ref(null)
    const layoutMode = ref('home') // 'home' | 'content'
    const isTransitioning = ref(false)

    // 用户相关状态
    const userStore = useUserStore()
    const showAuthDialog = ref(false)
    const showUserCenter = ref(false)
    const showUsageLimitDialog = ref(false)
    const showPurchaseDialog = ref(false)
    const showSubscriptionDialog = ref(false)
    const authMode = ref('login')
    const currentUsageInfo = ref(null)
    const showAboutDialog = ref(false)

    // 初始化用户状态
    onMounted(async () => {
      await userStore.initAuth()
      await loadAboutContent()
    })

    const selectFeature = async (feature) => {
      if (isTransitioning.value) return

      if (activeFeature.value === feature) {
        // 返回主页
        returnToHome()
      } else {
        // 管理后台功能直接进入，不需要检查登录状态和使用限制
        if (feature === 'admin') {
          switchToContent(feature)
          return
        }

        // 检查用户登录状态
        if (!userStore.isLoggedIn) {
          // 未登录用户点击任何功能都弹出登录提示
          handleShowAuth('login')
          return
        }

        // 检查使用限制
        const canUse = await checkUsageLimit()
        if (canUse) {
          // 切换到内容模式
          switchToContent(feature)
        }
        // 如果不能使用，checkUsageLimit会显示限制对话框
      }
    }

    const switchToContent = (feature) => {
      isTransitioning.value = true
      activeFeature.value = feature
      layoutMode.value = 'content'

      // 动画完成后重置过渡状态
      setTimeout(() => {
        isTransitioning.value = false
      }, 1200) // 动画持续时间
    }

    const returnToHome = () => {
      isTransitioning.value = true
      layoutMode.value = 'home'

      // 延迟清空activeFeature，让动画先完成
      setTimeout(() => {
        activeFeature.value = null
        isTransitioning.value = false
      }, 1200)
    }

    const getFeatureTitle = (feature) => {
      const titles = {
        content: '小萌爆款文案大师 - 一键生成选题-钩子-爆款文案-分镜脚本',
        recreation: '爆款二创 - 根据提供的文案进行二次专属创作',
        storyboard: '分镜脚本 - 根据文案内容生成详细拍摄镜头脚本',
        favorites: '我的收藏 - 生成内容不浪费，收藏下来可多次使用',
        admin: '管理后台 - 系统设置'
      }
      return titles[feature] || ''
    }

    const getActiveComponent = () => {
      const components = {
        content: 'ContentGenerator',
        recreation: 'ExplosiveContentRecreation',
        storyboard: 'Storyboard',
        favorites: 'MyFavorites',
        analysis: 'CompetitorAnalysis',
        extract: 'VideoTextExtraction',
        persona: 'PersonalIPDevelopment',
        admin: 'Admin'
      }
      return components[activeFeature.value] || null
    }

    // 用户相关方法
    const handleShowAuth = (mode = 'login') => {
      authMode.value = mode
      showAuthDialog.value = true
    }

    const handleShowUserCenter = () => {
      showUserCenter.value = true
    }

    const handleAuthSuccess = () => {
      // 认证成功后的处理
      showAuthDialog.value = false
    }

    // 关于内容状态
    const aboutContent = ref('广西蒙太奇影视传媒有限公司是一家拥有10年影视创作经验及制作公司，拥有丰富的创作经验，运营经验，在AI智能体井喷式的爆发增长下，公司利用最新的AI工具，集合了多年运营创作经验设计整合出全套为做自媒体帐号运营的工具，让企业及个人可以更高效创作内容。联系方式：13978445003，微信同号。')

    // 从后端获取关于内容
    const loadAboutContent = async () => {
      try {
        const response = await fetch('/api/about')
        const data = await response.json()
        if (data.success && data.content) {
          aboutContent.value = data.content
        }
      } catch (error) {
        console.error('加载关于内容失败:', error)
      }
    }

    // 即将推出功能提示
    const handleComingSoon = (featureName) => {
      ElMessage.info(`${featureName}功能即将推出，敬请期待！`)
    }


    // 检查使用限制
    const checkUsageLimit = async () => {
      try {
        const usageInfo = await userStore.checkUsageLimit()
        if (usageInfo && !usageInfo.canUse) {
          currentUsageInfo.value = usageInfo
          showUsageLimitDialog.value = true
          return false
        }
        return true
      } catch (error) {
        console.error('检查使用限制失败:', error)
        return true // 发生错误时允许使用，避免阻塞用户
      }
    }

    // 使用限制对话框相关方法
    const handleUsageLimitRegister = () => {
      showUsageLimitDialog.value = false
      authMode.value = 'register'
      showAuthDialog.value = true
    }

    const handleUsageLimitPurchase = () => {
      showUsageLimitDialog.value = false
      handleShowPurchase()
    }

    const handleUsageLimitSubscribe = () => {
      showUsageLimitDialog.value = false
      handleShowSubscription()
    }

    // 购买对话框相关方法
    const handleShowPurchase = () => {
      showPurchaseDialog.value = true
    }

    const handlePurchaseSuccess = async () => {
      showPurchaseDialog.value = false
      // 刷新用户信息
      await userStore.getUserProfile()
    }

    // 订阅对话框相关方法
    const handleShowSubscription = () => {
      showSubscriptionDialog.value = true
    }

    const handleSubscriptionSuccess = async () => {
      showSubscriptionDialog.value = false
      // 刷新用户信息
      await userStore.getUserProfile()
    }

    return {
      activeFeature,
      layoutMode,
      isTransitioning,
      selectFeature,
      switchToContent,
      returnToHome,
      getFeatureTitle,
      getActiveComponent,
      // 用户相关
      userStore,
      showAuthDialog,
      showUserCenter,
      showUsageLimitDialog,
      showPurchaseDialog,
      showSubscriptionDialog,
      showAboutDialog,
      authMode,
      currentUsageInfo,
      handleShowAuth,
      handleShowUserCenter,
      handleAuthSuccess,
      aboutContent,
      loadAboutContent,
      handleComingSoon,
      handleShowPurchase,
      handleShowSubscription,
      checkUsageLimit,
      handleUsageLimitRegister,
      handleUsageLimitPurchase,
      handleUsageLimitSubscribe,
      handlePurchaseSuccess,
      handleSubscriptionSuccess
    }
  }
}
</script>

<style>
/* 🤖 使用全局CSS变量系统 - 严格4色合规 */

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  background: linear-gradient(135deg,
    var(--color-bg-primary) 0%,
    var(--color-bg-primary) 70%,
    var(--color-accent-primary-light) 90%,
    var(--color-accent-secondary-light) 100%);
  background-attachment: fixed;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 大脑容器 */
.brain-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.6s ease;
}



/* 大脑中心区域 */
.brain-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 机器人容器 */
.robot-container {
  position: relative;
  width: 300px;
  height: 180px;
}

/* 机器人身体（静止） */
.robot-body {
  width: 300px;
  height: 180px;
  object-fit: contain;
  border-radius: 15px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  clip-path: inset(28.5% 0 0 0); /* 只显示身体部分 */
}

/* 机器人头部（浮动） */
.robot-head {
  width: 300px;
  height: 180px;
  object-fit: contain;
  border-radius: 15px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  clip-path: inset(0 0 71.5% 0); /* 只显示头部 */
  animation: robotFloat 3s ease-in-out infinite;
}

/* 保持原有的robot-image样式以兼容其他地方使用 */
.robot-image {
  width: 300px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(44, 62, 80, 0.2));
  border-radius: 15px;
  position: relative;
  z-index: 1;
}

/* 连接线SVG样式 */
.connection-svg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 300px;
  pointer-events: none;
  z-index: 0;
}

.brain-outline {
  fill: none;
  stroke: var(--accent-purple);
  stroke-width: 2;
  opacity: 0.8;
  animation: brainOutlineGlow 3s ease-in-out infinite alternate;
}

.brain-division {
  fill: none;
  stroke: var(--accent-blue);
  stroke-width: 1.5;
  opacity: 0.6;
  animation: brainDivisionPulse 2s ease-in-out infinite;
}

.neural-connections line {
  stroke: var(--accent-purple);
  opacity: 0.4;
  animation: neuralFlow 2.5s linear infinite;
}

.thinking-nodes .pulse-node {
  fill: var(--accent-blue);
  animation: nodePulse 1.8s ease-in-out infinite;
}

.thinking-nodes .pulse-node:nth-child(odd) {
  animation-delay: 0.3s;
}

.thinking-nodes .pulse-node:nth-child(even) {
  animation-delay: 0.8s;
}

/* 大脑到气泡连接线样式 */
.brain-to-bubble-connections .connection-line {
  fill: none;
  stroke: var(--accent-purple);
  stroke-width: 1.5;
  opacity: 0.3;
  transition: all 0.3s ease;
  animation: connectionPulse 3s linear infinite;
}

.connection-1 { animation-delay: 0s; }
.connection-2 { animation-delay: 0.5s; }
.connection-3 { animation-delay: 1s; }
.connection-4 { animation-delay: 1.5s; }
.connection-5 { animation-delay: 2s; }
.connection-6 { animation-delay: 2.5s; }

/* 气泡悬停时连接线发光 */
.bubble-1:hover ~ .brain-center .connection-1,
.bubble-2:hover ~ .brain-center .connection-2,
.bubble-3:hover ~ .brain-center .connection-3,
.bubble-4:hover ~ .brain-center .connection-4,
.bubble-5:hover ~ .brain-center .connection-5,
.bubble-6:hover ~ .brain-center .connection-6,
.bubble-7:hover ~ .brain-center .connection-7 {
  opacity: 1;
  stroke: var(--accent-blue);
  stroke-width: 2;
  filter: drop-shadow(0 0 8px var(--accent-blue));
}

/* 大脑标题 */
.brain-title {
  text-align: center;
  margin-top: 30px;
}

.brain-title h1 {
  font-size: 2.5em;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px 0;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.brain-title p {
  color: var(--secondary-black);
  opacity: 0.7;
  font-size: 0.8em;
  margin: 0;
  font-weight: 300;
}

/* 气泡导航系统 */
.bubble-navigation {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bubble {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-medium);
  cursor: pointer;
  pointer-events: all;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  animation: bubbleFloat 3s ease-in-out infinite;
  min-height: 44px; /* 移动端友好触控 */
  min-width: 44px;
}

.bubble:hover {
  transform: translateY(-8px) scale(1.1);
  background: var(--color-accent-primary);
  border-color: transparent;
  box-shadow: 0 16px 48px rgba(var(--color-accent-primary-rgb), 0.3);
  color: var(--color-bg-primary);
}

.bubble.active {
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
  border-color: transparent;
  transform: scale(1.15);
  box-shadow: 0 12px 40px rgba(var(--color-accent-primary-rgb), 0.4);
}

.bubble-icon {
  font-size: 24px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.bubble:hover .bubble-icon,
.bubble.active .bubble-icon {
  transform: scale(1.2);
  animation: iconSpin 0.6s ease-in-out;
}

.bubble-text {
  text-align: center;
  line-height: 1.2;
}

.bubble-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.bubble-desc {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  font-weight: 400;
}

/* 思维粒子效果 */
.thinking-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, var(--accent-purple), var(--accent-blue));
  border-radius: 50%;
  animation: particleFloat 8s infinite ease-in-out;
  opacity: 0.6;
}

.particle-1 { top: 15%; left: 45%; animation-delay: 0s; }
.particle-2 { top: 25%; right: 40%; animation-delay: 1s; }
.particle-3 { bottom: 35%; right: 45%; animation-delay: 2s; }
.particle-4 { bottom: 25%; left: 42%; animation-delay: 3s; }
.particle-5 { top: 40%; left: 38%; animation-delay: 4s; }
.particle-6 { top: 35%; right: 38%; animation-delay: 5s; }
.particle-7 { top: 60%; left: 48%; animation-delay: 6s; }
.particle-8 { top: 55%; right: 48%; animation-delay: 7s; }

/* 点击波纹效果 */
.thinking-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border: 2px solid var(--accent-purple);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: thinkingRipple 1s ease-out forwards;
  pointer-events: none;
}

/* 气泡悬停预览提示 */
.bubble::after {
  content: attr(title);
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(44, 62, 80, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 100;
}

.bubble:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

/* 内容模式下的压缩气泡工具提示增强 */
.layout-content .bubble::after {
  bottom: -40px;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  font-size: 10px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(8px);
  white-space: nowrap;
  z-index: 1001;
}

.layout-content .bubble:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

/* 气泡位置布局 - 围绕机器人均匀分布，4个气泡更加平衡 */

/* 内容生成 - 左上方 */
.bubble-1 {
  top: 12%; left: 22%;
  width: 170px; height: 170px;
  animation-delay: 0s;
  z-index: 10;
}

/* 爆款二创 - 右上方 */
.bubble-2 {
  top: 12%; right: 22%;
  width: 105px; height: 105px;
  animation-delay: 0.5s;
  z-index: 9;
}

/* 分镜脚本 - 右下方 */
.bubble-3 {
  bottom: 12%; right: 22%;
  width: 95px; height: 95px;
  animation-delay: 1s;
  z-index: 10;
}

/* 我的收藏 - 左下方 */
.bubble-4 {
  bottom: 12%; left: 22%;
  width: 80px; height: 80px;
  animation-delay: 1.5s;
  z-index: 8;
}

/* 对标拆解 - 左中 */
.bubble-5 {
  top: 50%; left: 8%;
  width: 90px; height: 90px;
  animation-delay: 2s;
  z-index: 7;
}

/* 提取文字 - 右中 */
.bubble-6 {
  top: 50%; right: 8%;
  width: 75px; height: 75px;
  animation-delay: 2.5s;
  z-index: 6;
}

/* 人设IP - 正上方 */
.bubble-7 {
  top: 5%; left: 50%;
  transform: translateX(-50%);
  width: 70px; height: 70px;
  animation-delay: 3s;
  z-index: 5;
}

/* 横屏模式下气泡位置优化 - 更靠近机器人但不重叠 */
@media (max-width: 768px) and (max-height: 500px) {
  .bubble-1 {
    top: 15%; left: 25%;
    width: 140px; height: 140px;
  }

  .bubble-2 {
    top: 15%; right: 25%;
    width: 80px; height: 80px;
  }

  .bubble-3 {
    bottom: 15%; right: 25%;
    width: 70px; height: 70px;
  }

  .bubble-4 {
    bottom: 15%; left: 25%;
    width: 60px; height: 60px;
  }

  .bubble-5 {
    top: 50%; left: 12%;
    width: 75px; height: 75px;
  }

  .bubble-6 {
    top: 50%; right: 12%;
    width: 60px; height: 60px;
  }

  .bubble-7 {
    top: 8%; left: 50%;
    width: 55px; height: 55px;
  }

  .bubble-icon {
    font-size: 18px !important;
  }

  .bubble-title {
    font-size: 10px !important;
  }

  .bubble-desc {
    font-size: 8px !important;
  }
}

/* === 🚀 新的全屏布局系统 === */

/* 布局状态切换 */
.brain-container {
  transition: var(--transition-slow);
  will-change: transform;
}

.brain-container.layout-content {
  background: linear-gradient(135deg,
    var(--color-bg-primary) 0%,
    var(--color-bg-secondary) 100%);
}

/* 气泡动画：移动到右上角并排列 */
.layout-content .bubble-navigation {
  display: none; /* 隐藏内容模式下的导航气泡 */
}

.layout-content .bubble,
.layout-content .bubble-1,
.layout-content .bubble-2,
.layout-content .bubble-3,
.layout-content .bubble-4 {
  position: relative !important;
  width: 50px !important;
  height: 50px !important;
  margin: 0 5px !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
  transform: none !important;
  transform-origin: center !important;
  box-shadow: var(--shadow-small) !important;
  transition: var(--transition-slow) !important;
  padding: 8px !important;
}

/* 内容模式下放大图标和文字以铺满汽泡 */
.brain-container.layout-content .bubble-icon {
  font-size: 20px !important;
  margin-bottom: 4px !important;
}

.brain-container.layout-content .bubble-text {
  font-size: 10px !important;
  line-height: 1.2 !important;
}

.brain-container.layout-content .bubble-title {
  font-size: 10px !important;
  font-weight: 600 !important;
}

.layout-content .bubble-desc {
  display: none !important;
}

/* 机器人位置向下移动 */
.brain-container.layout-content .brain-center {
  top: 40px !important;
}

/* 活跃状态的气泡高亮 */
.layout-content .bubble.active {
  background: var(--color-accent-primary) !important;
  color: var(--color-bg-primary) !important;
  box-shadow: 0 4px 20px rgba(var(--color-accent-primary-rgb), 0.4) !important;
  transform: scale(1.1) !important;
}

/* 机器人动画：移动到左上角作为返回按钮 */
.layout-content .brain-center {
  position: fixed;
  top: 20px;
  left: 120px;
  transform: none;
  z-index: 999;
  transition: var(--transition-slow);
  cursor: pointer;
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
}

.layout-content .brain-center:hover {
  background: var(--color-accent-primary-light);
  transform: scale(1.05);
  box-shadow: var(--shadow-medium);
}

.layout-content .brain-center:active {
  transform: scale(0.95);
  background: var(--color-accent-primary);
}

.layout-content .robot-container {
  width: 120px !important;
  height: 72px !important;
  transition: var(--transition-slow) !important;
}

.layout-content .robot-body,
.layout-content .robot-head {
  width: 120px !important;
  height: 72px !important;
  transition: var(--transition-slow) !important;
}

.layout-content .brain-title {
  display: none; /* 内容模式下隐藏标题 */
}

/* 连接线和粒子效果在内容模式下隐藏 */
.layout-content .connection-svg,
.layout-content .thinking-particles {
  opacity: 0;
  transition: opacity 0.6s ease;
}

/* 机器人对话气泡样式 - 恢复横向头顶布局 */
.robot-speech-bubble {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border);
  z-index: 1001;
  animation: speechBubbleFloat 2s ease-in-out infinite;
}

/* 对话气泡小尖角 - 恢复横向版本 */
.robot-speech-bubble::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--color-bg-primary);
}

/* 对话气泡小尖角边框 */
.robot-speech-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -7px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid var(--color-border);
  z-index: -1;
}

@keyframes speechBubbleFloat {
  0%, 100% {
    transform: translateY(0px);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* 全屏内容区域 - 中间渐变淡出效果 */
.fullscreen-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-bg-primary);
  z-index: 100;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: scale(0.95);
  animation: contentFadeIn 0.6s ease-out forwards;
  overflow: hidden;
}

.content-main {
  flex: 1;
  overflow-y: auto;
  padding-top: 80px; /* 只给机器人预留空间，不需要气泡空间 */
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  padding-bottom: var(--spacing-lg);
  background: var(--color-bg-primary);
  position: relative;
  z-index: 101;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* 水平居中 */
}

/* 🎬 统一的平滑渐变动画 */

@keyframes contentFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 竖屏优化 - 专门针对竖屏设备，重新布局避免重叠 */
@media (orientation: portrait) and (max-aspect-ratio: 4/5) {
  /* 主要气泡重新定位 - 避免重叠 */
  .bubble-1 {
    top: 18%; left: 15%;
    width: 155px; height: 155px;
  }

  .bubble-2 {
    top: 18%; right: 15%;
    width: 85px; height: 85px;
  }

  .bubble-3 {
    bottom: 25%; right: 15%;
    width: 75px; height: 75px;
  }

  .bubble-4 {
    bottom: 25%; left: 15%;
    width: 65px; height: 65px;
  }

  .bubble-5 {
    top: 45%; left: 5%;
    width: 80px; height: 80px;
  }

  .bubble-6 {
    top: 45%; right: 5%;
    width: 65px; height: 65px;
  }

  /* 人设IP气泡 - 移动到底部左中，避免与顶部气泡重叠 */
  .bubble-7 {
    bottom: 12%; left: 40%;
    transform: translateX(-50%);
    width: 60px; height: 60px;
  }

  /* 竖屏模式下副标题更小 */
  .brain-title p {
    font-size: 0.65em !important;
  }

  /* 竖屏时调整字体大小确保可读性 */
  .bubble-icon {
    font-size: 16px !important;
  }

  .bubble-title {
    font-size: 9px !important;
  }

  .bubble-desc {
    font-size: 7px !important;
  }

  /* 竖屏时右上角导航按钮更小 */
  .user-interface {
    top: 10px !important;
    right: 5px !important;
    gap: 2px !important;
    transform: scale(0.75) !important;
    transform-origin: top right !important;
  }

  .usage-counter {
    padding: 2px 4px !important;
    font-size: 8px !important;
  }

  .usage-text,
  .user-name {
    font-size: 7px !important;
  }

  .user-info-wrapper {
    padding: 1px 3px !important;
    gap: 2px !important;
  }

  .user-avatar {
    width: 16px !important;
    height: 16px !important;
  }

  .admin-btn,
  .login-btn,
  .register-btn {
    font-size: 7px !important;
    padding: 1px 3px !important;
    min-width: 25px !important;
    height: 18px !important;
  }

  /* 内容模式下的竖屏布局 */
  .layout-content .brain-center {
    left: 30px !important;
  }

  .layout-content .bubble-navigation {
    right: 15px !important;
    gap: 4px !important;
  }

  .layout-content .bubble {
    width: 11px !important;
    height: 11px !important;
    padding: 1px !important;
  }

  .layout-content .bubble-icon {
    font-size: 8px !important;
  }

  .layout-content .bubble-text {
    font-size: 5px !important;
  }

  .layout-content .bubble-title {
    font-size: 5px !important;
  }

  .content-main {
    padding-top: 70px !important;
  }
}

/* 移动端响应式优化 - 确保触控友好性 */
@media (max-width: 768px) {
  .layout-content .bubble-navigation {
    top: 15px;
    right: 30px;
    gap: 3px;
  }

  .layout-content .bubble,
  .layout-content .bubble-1,
  .layout-content .bubble-2,
  .layout-content .bubble-3,
  .layout-content .bubble-4 {
    width: 32px !important;
    height: 32px !important;
    padding: 3px !important;
  }

  /* 强制移动端气泡变小 - 最高优先级 */
  .brain-container.layout-content .bubble-navigation .bubble {
    width: 32px !important;
    height: 32px !important;
  }

  .layout-content .bubble-icon {
    font-size: 14px !important;
  }

  .layout-content .bubble-text {
    font-size: 6px !important;
  }

  .layout-content .bubble-title {
    font-size: 6px !important;
  }

  .layout-content .brain-center {
    top: 15px;
    left: 80px;
    padding: var(--spacing-xs);
    min-width: 44px; /* 确保触控友好 */
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .layout-content .robot-container {
    width: 93px !important;
    height: 56px !important;
  }

  .layout-content .robot-body,
  .layout-content .robot-head {
    width: 93px !important;
    height: 56px !important;
  }

  .layout-content .robot-speech-bubble {
    font-size: 10px !important;
    padding: 4px 8px !important;
  }

  .content-main {
    padding-top: 70px; /* 移动端进一步减少上间距 */
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    padding-bottom: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .layout-content .bubble,
  .layout-content .bubble-1,
  .layout-content .bubble-2,
  .layout-content .bubble-3,
  .layout-content .bubble-4 {
    width: 11px !important;
    height: 11px !important;
    padding: 1px !important;
  }

  .layout-content .bubble-icon {
    font-size: 8px !important;
  }

  .layout-content .bubble-text {
    font-size: 5px !important;
  }

  .layout-content .bubble-title {
    font-size: 5px !important;
  }
}

@keyframes brainPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes robotFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

@keyframes brainOutlineGlow {
  0% { opacity: 0.6; stroke-width: 2; }
  100% { opacity: 1; stroke-width: 2.5; }
}

@keyframes brainDivisionPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes neuralFlow {
  0% { opacity: 0.2; }
  50% { opacity: 0.6; }
  100% { opacity: 0.2; }
}

@keyframes nodePulse {
  0%, 100% { r: 3; opacity: 0.6; }
  50% { r: 5; opacity: 1; }
}

@keyframes titleGlow {
  0% { filter: drop-shadow(0 0 10px rgba(118, 75, 162, 0.3)); }
  100% { filter: drop-shadow(0 0 20px rgba(118, 75, 162, 0.6)); }
}

@keyframes bubbleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(1deg); }
  66% { transform: translateY(4px) rotate(-1deg); }
}

@keyframes iconSpin {
  0% { transform: rotate(0deg) scale(1.2); }
  50% { transform: rotate(180deg) scale(1.3); }
  100% { transform: rotate(360deg) scale(1.2); }
}

@keyframes connectionPulse {
  0%, 100% { opacity: 0.2; stroke-dashoffset: 0; }
  50% { opacity: 0.6; stroke-dashoffset: -10; }
}

@keyframes brainBirth {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes thinkingRipple {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
    opacity: 0.9;
  }
}

/* === 移动端优先响应式设计 === */

/* 基础移动端样式（320px+） - 默认  */
.brain-container {
  padding: var(--spacing-md);
}

.bubble {
  min-width: 80px;
  min-height: 80px;
  width: 80px;
  height: 80px;
  padding: var(--spacing-sm);
}

.bubble-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.bubble-title {
  font-size: 10px;
  font-weight: 600;
}

.bubble-desc {
  font-size: 9px;
  display: none; /* 隐藏在小屏幕 */
}

.content-panel {
  width: 95%;
  height: 85vh;
  max-height: calc(100vh - 40px);
}

.brain-title h1 {
  font-size: 1.8em;
}

.brain-title p {
  font-size: 1em;
}

/* 小屏手机（360px+） */
@media (min-width: 360px) {
  .bubble {
    width: 85px;
    height: 85px;
    padding: var(--spacing-sm);
  }

  .bubble-icon {
    font-size: 19px;
  }

  .bubble-title {
    font-size: 11px;
  }

  .brain-title h1 {
    font-size: 1.9em;
  }
}

/* 大屏手机（414px+） */
@media (min-width: 414px) {
  .bubble {
    width: 90px;
    height: 90px;
  }

  .bubble-desc {
    display: block;
    font-size: 9px;
  }

  .content-panel {
    width: 90%;
    height: 80vh;
  }

  .brain-title h1 {
    font-size: 2em;
  }
}

/* 平板竖屏（768px+） */
@media (min-width: 768px) {
  .brain-container {
    padding: var(--spacing-lg);
  }

  .robot-image {
    width: 280px;
    height: 160px;
  }

  .connection-svg {
    width: 350px;
    height: 250px;
  }

  .bubble {
    width: 100px;
    height: 100px;
    padding: var(--spacing-md);
  }

  .bubble-icon {
    font-size: 20px;
    margin-bottom: var(--spacing-sm);
  }

  .bubble-title {
    font-size: 12px;
  }

  .bubble-desc {
    font-size: 10px;
  }

  .content-panel {
    width: 85%;
    height: 75vh;
  }

  .brain-title h1 {
    font-size: 2.2em;
  }

  /* 平板气泡重新布局 - 5个气泡 */
  .bubble-1 { top: 15%; left: 18%; width: 145px; height: 145px; } /* 内容生成 */
  .bubble-2 { top: 20%; right: 18%; width: 80px; height: 80px; } /* 二创工具 */
  .bubble-3 { bottom: 20%; right: 18%; width: 72px; height: 72px; } /* 分镜脚本 */
  .bubble-4 { bottom: 15%; left: 18%; width: 57px; height: 57px; } /* 收藏夹 */
  .bubble-5 { top: 50%; left: 8%; width: 64px; height: 64px; } /* 管理后台 */
}

/* 平板横屏/小桌面（1024px+） */
@media (min-width: 1024px) {
  .robot-image {
    width: 300px;
    height: 180px;
  }

  .connection-svg {
    width: 400px;
    height: 300px;
  }

  .bubble {
    width: 120px;
    height: 120px;
    padding: var(--spacing-md);
  }

  .bubble-icon {
    font-size: 24px;
  }

  .bubble-title {
    font-size: 14px;
  }

  .bubble-desc {
    font-size: 12px;
  }

  .content-panel {
    width: 70%;
    height: 70vh;
  }

  .brain-title h1 {
    font-size: 2.5em;
  }

  /* 桌面气泡标准布局 - 5个气泡 */
  .bubble-1 { top: 20%; left: 25%; width: 170px; height: 170px; } /* 内容生成 */
  .bubble-2 { top: 25%; right: 25%; width: 100px; height: 100px; } /* 二创工具 */
  .bubble-3 { bottom: 25%; right: 25%; width: 90px; height: 90px; } /* 分镜脚本 */
  .bubble-4 { bottom: 20%; left: 25%; width: 70px; height: 70px; } /* 收藏夹 */
  .bubble-5 { top: 50%; left: 15%; width: 67px; height: 67px; } /* 管理后台 */
}

/* 大桌面（1440px+） */
@media (min-width: 1440px) {
  .content-panel {
    width: 50%;
    height: 70vh;
  }
}

/* 触控友好设计增强 */
@media (hover: none) and (pointer: coarse) {
  .bubble {
    min-height: 88px; /* 更大的触控区域 */
    min-width: 88px;
  }

  .bubble-icon {
    pointer-events: none;
  }

  /* 移除悬停效果在触控设备 */
  .bubble:hover {
    transform: none;
  }

  /* 使用 :active 替代 :hover */
  .bubble:active {
    transform: scale(0.95);
    background: var(--color-accent-primary);
    color: var(--color-bg-primary);
  }
}

/* 滚动条美化 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--accent-purple) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  border-radius: 4px;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #6b46c1, #5a67d8);
}

/* 用户界面区域样式 */
.user-interface {
  position: fixed;
  top: 20px;
  right: 120px; /* 进一步往左移动，确保用户中心显示完全 */
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  transition: var(--transition-slow);
}

.user-interface.layout-content {
  top: 20px; /* 恢复正常高度，因为没有气泡导航了 */
  right: 120px; /* 内容模式下与主页位置保持一致 */
}

/* 使用次数计数器 */
.usage-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px 12px;
  box-shadow: var(--shadow-small);
  transition: var(--transition-base);
}

.usage-counter:hover {
  background: var(--color-accent-primary-light);
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-medium);
}

.usage-icon {
  font-size: 16px;
  color: var(--color-accent-primary);
}

.usage-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

/* 用户头像区域 */
.user-avatar-section {
  display: flex;
  align-items: center;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-small);
  cursor: pointer;
  transition: var(--transition-base);
}

.user-info-wrapper:hover {
  background: var(--color-accent-primary-light);
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.user-avatar {
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-small);
  transition: var(--transition-base);
}

.user-info-wrapper:hover .user-avatar {
  border-color: var(--color-accent-primary);
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

/* 管理后台按钮区域 */
.admin-section {
  display: flex;
  align-items: center;
}

.admin-btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  min-width: 80px;
  box-shadow: var(--shadow-small);
  transition: var(--transition-base);
}

.admin-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.admin-btn .el-icon {
  margin-right: 4px;
}

/* 登录按钮区域 */
.login-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 移动端横竖屏导航调整 */
@media (max-width: 768px) {
  .user-interface {
    gap: 6px !important;
    padding: 8px 12px !important;
    right: 8px !important;
  }

  .usage-counter,
  .admin-section,
  .user-avatar-section,
  .login-section {
    font-size: 11px !important;
  }

  .usage-text,
  .user-name {
    font-size: 10px !important;
  }

  .admin-btn,
  .login-btn,
  .register-btn {
    font-size: 10px !important;
    padding: 4px 8px !important;
    min-width: 50px !important;
  }
}

/* 横屏模式强制样式 - 最高优先级 */
@media (max-width: 768px) and (max-height: 500px) {
  .user-interface {
    top: 10px !important;
    right: 5px !important;
    gap: 3px !important;
    padding: 4px 6px !important;
    transform: scale(0.85) !important;
    transform-origin: top right !important;
  }

  .user-interface.layout-content {
    top: 10px !important;
    right: 5px !important;
  }

  .usage-counter {
    padding: 3px 6px !important;
    font-size: 9px !important;
  }

  .usage-text,
  .user-name {
    font-size: 8px !important;
    white-space: nowrap !important;
  }

  .user-info-wrapper {
    padding: 2px 6px !important;
    gap: 4px !important;
  }

  .user-avatar {
    width: 20px !important;
    height: 20px !important;
  }

  .admin-btn,
  .login-btn,
  .register-btn {
    font-size: 8px !important;
    padding: 2px 6px !important;
    min-width: 40px !important;
    height: 24px !important;
  }
}

.login-btn,
.register-btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  min-width: 60px;
  box-shadow: var(--shadow-small);
  transition: var(--transition-base);
}

.login-btn:hover,
.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.register-btn {
  background: transparent;
  border: 1px solid var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.register-btn:hover {
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .user-interface {
    top: 15px;
    right: 80px; /* 移动端也进一步往左移动，确保显示完全 */
    gap: 10px;
  }

  .user-interface.layout-content {
    top: 15px; /* 移动端恢复正常高度 */
    right: 80px; /* 移动端内容模式下与主页位置保持一致 */
  }

  .usage-counter {
    padding: 6px 10px;
  }

  .usage-text {
    font-size: 12px;
  }

  .user-info-wrapper {
    padding: 4px 8px;
    gap: 6px;
  }

  .user-avatar {
    width: 28px !important;
    height: 28px !important;
  }

  .user-name {
    font-size: 12px;
  }

  .login-btn,
  .register-btn {
    font-size: 12px;
    padding: 6px 12px;
    min-width: 50px;
  }
}

@media (max-width: 480px) {
  .user-interface {
    gap: 8px;
  }

  .usage-counter {
    padding: 4px 8px;
  }

  .usage-text {
    font-size: 11px;
  }

  .user-avatar {
    width: 30px !important;
    height: 30px !important;
  }
}

/* 关于萌太奇按钮 */
.about-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.about-btn {
  transition: var(--transition-base);
  box-shadow: var(--shadow-small);
  padding: 8px 16px;
  border-radius: var(--radius-md);
}

.about-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.about-btn .el-icon {
  margin-right: 6px;
}
</style>