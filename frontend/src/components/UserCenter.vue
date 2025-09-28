<template>
  <el-dialog
    v-model="visible"
    title="用户中心"
    width="500px"
    :before-close="handleClose"
    class="user-center-dialog"
  >
    <div class="user-center-container">
      <!-- 用户信息 -->
      <div class="user-info-section">
        <div class="user-avatar">
          <el-avatar :size="60" :icon="User" />
        </div>
        <div class="user-details">
          <h3 v-if="!userStore.isLoggedIn">访客用户</h3>
          <h3 v-else>{{ userStore.user?.email }}</h3>
          <div class="user-type">
            <el-tag v-if="!userStore.isLoggedIn" type="info" size="small">访客模式</el-tag>
            <el-tag v-else-if="userStore.isAdmin" type="warning" size="small">管理员账户</el-tag>
            <el-tag v-else type="success" size="small">注册用户</el-tag>
          </div>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="usage-section">
        <h4>使用统计</h4>
        <div class="usage-cards">
          <!-- 免费使用次数 -->
          <div class="usage-card">
            <div class="usage-icon">🎁</div>
            <div class="usage-info">
              <div class="usage-label">免费次数</div>
              <div class="usage-count">
                {{ userStore.usageInfo.freeUsageCount }} / {{ userStore.usageInfo.freeUsageLimit }}
              </div>
              <el-progress
                :percentage="(userStore.usageInfo.freeUsageCount / userStore.usageInfo.freeUsageLimit) * 100"
                :stroke-width="6"
                :show-text="false"
              />
            </div>
          </div>

          <!-- 付费使用次数 -->
          <div v-if="userStore.isLoggedIn" class="usage-card">
            <div class="usage-icon">💰</div>
            <div class="usage-info">
              <div class="usage-label">付费次数</div>
              <div class="usage-count">
                {{ userStore.usageInfo.paidUsageCount }} / {{ userStore.usageInfo.totalPurchased }}
              </div>
              <el-progress
                :percentage="userStore.usageInfo.totalPurchased > 0 ? (userStore.usageInfo.paidUsageCount / userStore.usageInfo.totalPurchased) * 100 : 0"
                :stroke-width="6"
                :show-text="false"
                color="#f56c6c"
              />
            </div>
          </div>

          <!-- 剩余使用次数 -->
          <div class="usage-card highlight">
            <div class="usage-icon">⚡</div>
            <div class="usage-info">
              <div class="usage-label">剩余次数</div>
              <div class="usage-count large">
                {{ userStore.getRemainingUsage }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐码（仅注册用户） -->
      <div v-if="userStore.isLoggedIn" class="referral-section">
        <h4>推荐好友奖励</h4>

        <!-- 推荐统计 -->
        <div class="referral-stats">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-label">已邀请好友</div>
              <div class="stat-value">{{ referralStats.totalInvites || 0 }} 人</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎁</div>
            <div class="stat-info">
              <div class="stat-label">奖励次数</div>
              <div class="stat-value">{{ referralStats.totalRewards || 0 }} 次</div>
            </div>
          </div>
        </div>

        <!-- 推荐码卡片 -->
        <div class="referral-card">
          <div class="referral-info">
            <div class="referral-label">您的专属推荐码</div>
            <div class="referral-code">
              {{ userStore.user?.referralCode }}
            </div>
            <div class="referral-desc">
              邀请好友注册，双方各得 <strong>5次</strong> 免费使用机会
            </div>
          </div>
          <div class="referral-actions">
            <el-button
              type="primary"
              size="small"
              @click="copyReferralCode"
            >
              复制推荐码
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="shareReferralLink"
            >
              分享链接
            </el-button>
          </div>
        </div>

        <!-- 推荐历史记录 -->
        <div v-if="referralHistory.length > 0" class="referral-history">
          <div class="history-header">
            <span>推荐历史</span>
            <el-button type="text" size="small" @click="showAllHistory = !showAllHistory">
              {{ showAllHistory ? '收起' : '查看全部' }}
            </el-button>
          </div>
          <div class="history-list">
            <div
              v-for="(record, index) in displayedHistory"
              :key="index"
              class="history-item"
            >
              <div class="history-info">
                <div class="history-user">用户 {{ record.userId.substring(0, 8) }}***</div>
                <div class="history-time">{{ formatTime(record.createdAt) }}</div>
              </div>
              <div class="history-reward">+5次</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <div v-if="!userStore.isLoggedIn" class="guest-actions">
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            @click="showRegister"
          >
            注册获得更多免费次数
          </el-button>
          <p class="register-tip">注册可获得 <strong>10次</strong> 免费使用机会</p>
        </div>

        <div v-else class="user-actions">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                @click="showPurchase"
              >
                购买次数
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button
                type="success"
                size="large"
                style="width: 100%"
                @click="showSubscription"
              >
                订阅服务
              </el-button>
            </el-col>
          </el-row>

          <el-button
            type="info"
            size="large"
            style="width: 100%; margin-top: 12px"
            @click="logout"
          >
            退出登录
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'show-auth', 'show-purchase', 'show-subscription'])

// Store
const userStore = useUserStore()

// 推荐相关状态
const referralStats = ref({
  totalInvites: 0,
  totalRewards: 0
})
const referralHistory = ref([])
const showAllHistory = ref(false)

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const displayedHistory = computed(() => {
  if (showAllHistory.value) {
    return referralHistory.value
  }
  return referralHistory.value.slice(0, 3)
})

// 方法
const handleClose = (done) => {
  done()
}

const copyReferralCode = () => {
  const referralCode = userStore.user?.referralCode
  if (referralCode) {
    navigator.clipboard.writeText(referralCode).then(() => {
      ElMessage.success('推荐码已复制到剪贴板')
    }).catch(() => {
      // 降级处理
      const textArea = document.createElement('textarea')
      textArea.value = referralCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('推荐码已复制到剪贴板')
    })
  }
}

const showRegister = () => {
  visible.value = false
  emit('show-auth', 'register')
}

const showPurchase = () => {
  visible.value = false
  emit('show-purchase')
}

const showSubscription = () => {
  visible.value = false
  emit('show-subscription')
}

const logout = () => {
  userStore.logout()
  visible.value = false
  ElMessage.success('已退出登录')
}

// 推荐相关方法
const shareReferralLink = () => {
  const referralCode = userStore.user?.referralCode
  if (referralCode) {
    const shareLink = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(shareLink).then(() => {
      ElMessage.success('推荐链接已复制到剪贴板')
    }).catch(() => {
      // 降级处理
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('推荐链接已复制到剪贴板')
    })
  }
}

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadReferralData = async () => {
  if (!userStore.isLoggedIn) return

  try {
    // 模拟数据，实际应该从API获取
    referralStats.value = {
      totalInvites: 3,
      totalRewards: 15
    }

    referralHistory.value = [
      {
        userId: 'user12345678',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2天前
      },
      {
        userId: 'user87654321',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5天前
      },
      {
        userId: 'user11223344',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString() // 10天前
      }
    ]
  } catch (error) {
    console.error('加载推荐数据失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadReferralData()
})
</script>

<style scoped>
.user-center-dialog {
  --el-dialog-border-radius: 12px;
}

.user-center-container {
  padding: 20px 0;
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.user-avatar {
  margin-right: 15px;
}

.user-details h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.user-type {
  margin-top: 5px;
}

.usage-section {
  margin-bottom: 30px;
}

.usage-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.usage-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.usage-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.usage-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.usage-card.highlight {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border-color: var(--el-color-primary-light-5);
}

.usage-icon {
  font-size: 20px;
  margin-right: 10px;
}

.usage-info {
  flex: 1;
}

.usage-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 5px;
}

.usage-count {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.usage-count.large {
  font-size: 24px;
  color: var(--el-color-primary);
}

.referral-section {
  margin-bottom: 30px;
}

.referral-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

/* 推荐统计卡片 */
.referral-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.stat-icon {
  font-size: 24px;
  margin-right: 12px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 推荐卡片 */
.referral-card {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.referral-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.referral-info {
  flex: 1;
}

.referral-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 5px;
}

.referral-code {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
}

.referral-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.referral-desc strong {
  color: var(--el-color-success);
}

/* 推荐历史 */
.referral-history {
  margin-top: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.history-list {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  flex: 1;
}

.history-user {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.history-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.history-reward {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  padding: 4px 8px;
  border-radius: 4px;
}

.action-section {
  margin-top: 30px;
}

.guest-actions .register-tip {
  text-align: center;
  margin-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.guest-actions strong {
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .user-center-dialog {
    --el-dialog-width: 90vw !important;
  }

  .user-center-container {
    padding: 10px 0;
  }

  .usage-cards {
    grid-template-columns: 1fr;
  }

  .referral-card {
    flex-direction: column;
    text-align: center;
  }

  .referral-info {
    margin-bottom: 15px;
  }
}
</style>