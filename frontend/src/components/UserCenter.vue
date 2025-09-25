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
          <h3 v-if="userStore.isGuest">访客用户</h3>
          <h3 v-else>{{ userStore.user?.email }}</h3>
          <div class="user-type">
            <el-tag v-if="userStore.isGuest" type="info" size="small">访客模式</el-tag>
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
          <div v-if="!userStore.isGuest" class="usage-card">
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
      <div v-if="!userStore.isGuest" class="referral-section">
        <h4>推荐好友</h4>
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
          <el-button
            type="primary"
            size="small"
            @click="copyReferralCode"
          >
            复制推荐码
          </el-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <div v-if="userStore.isGuest" class="guest-actions">
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
import { computed } from 'vue'
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

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
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

.referral-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
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