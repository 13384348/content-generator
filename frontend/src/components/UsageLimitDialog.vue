<template>
  <el-dialog
    v-model="visible"
    title="使用次数不足"
    width="450px"
    :before-close="handleClose"
    class="usage-limit-dialog"
    :close-on-click-modal="false"
  >
    <div class="usage-limit-container">
      <!-- 图标和提示 -->
      <div class="limit-icon-section">
        <el-icon class="limit-icon" :size="60"><WarnTriangleFilled /></el-icon>
        <h3 class="limit-title">{{ limitTitle }}</h3>
        <p class="limit-message">{{ limitMessage }}</p>
      </div>

      <!-- 使用情况统计 -->
      <div class="usage-stats" v-if="usageInfo">
        <div class="stats-card">
          <div class="stat-item">
            <span class="stat-label">免费剩余</span>
            <span class="stat-value">{{ freeRemaining }}</span>
          </div>
          <div class="stat-item" v-if="!isGuest">
            <span class="stat-label">付费剩余</span>
            <span class="stat-value">{{ paidRemaining }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总剩余</span>
            <span class="stat-value highlight">{{ totalRemaining }}</span>
          </div>
        </div>
      </div>

      <!-- 升级建议 -->
      <div class="upgrade-suggestions">
        <div class="suggestion-card" v-if="isGuest">
          <div class="suggestion-icon">🎁</div>
          <div class="suggestion-content">
            <h4>注册获得更多免费次数</h4>
            <p>注册账户立即获得 <strong>10次</strong> 免费使用机会</p>
            <el-button type="primary" size="large" @click="handleRegister" class="suggestion-btn">
              立即注册
            </el-button>
          </div>
        </div>

        <div class="suggestion-card" v-else>
          <div class="suggestion-icon">💰</div>
          <div class="suggestion-content">
            <h4>购买使用次数包</h4>
            <p>选择适合的次数包，继续畅享AI内容生成</p>
            <div class="package-options">
              <div class="package-item">
                <span class="package-name">基础包</span>
                <span class="package-desc">100次 - ¥19</span>
              </div>
              <div class="package-item recommended">
                <span class="package-badge">推荐</span>
                <span class="package-name">超值包</span>
                <span class="package-desc">300次 - ¥49</span>
              </div>
            </div>
            <el-button type="primary" size="large" @click="handlePurchase" class="suggestion-btn">
              购买次数包
            </el-button>
          </div>
        </div>

        <div class="suggestion-card subscription" v-if="!isGuest">
          <div class="suggestion-icon">⭐</div>
          <div class="suggestion-content">
            <h4>订阅无限制服务</h4>
            <p>月度订阅，无限使用，更多高级功能</p>
            <div class="subscription-options">
              <div class="sub-item">
                <span class="sub-name">标准版</span>
                <span class="sub-desc">200次/月 - ¥29</span>
              </div>
              <div class="sub-item popular">
                <span class="sub-badge">热门</span>
                <span class="sub-name">专业版</span>
                <span class="sub-desc">600次/月 - ¥79</span>
              </div>
            </div>
            <el-button type="success" size="large" @click="handleSubscribe" class="suggestion-btn">
              选择订阅
            </el-button>
          </div>
        </div>
      </div>

      <!-- 推荐码提醒 -->
      <div class="referral-reminder" v-if="isGuest">
        <el-alert
          title="小贴士"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            使用朋友的推荐码注册，双方各获得 <strong>5次</strong> 免费使用机会！
          </template>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">
          稍后再说
        </el-button>
        <el-button
          type="primary"
          @click="handlePrimaryAction"
          size="large"
          class="primary-action-btn"
        >
          {{ primaryActionText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  usageInfo: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'register', 'purchase', 'subscribe'])

// Store
const userStore = useUserStore()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算属性
const isGuest = computed(() => userStore.isGuest)

const freeRemaining = computed(() => {
  return Math.max(0, (props.usageInfo?.freeUsageLimit || 0) - (props.usageInfo?.freeUsageCount || 0))
})

const paidRemaining = computed(() => {
  return Math.max(0, (props.usageInfo?.totalPurchased || 0) - (props.usageInfo?.paidUsageCount || 0))
})

const totalRemaining = computed(() => {
  return freeRemaining.value + paidRemaining.value
})

const limitTitle = computed(() => {
  if (isGuest.value) {
    return '访客使用次数已用完'
  } else if (freeRemaining.value === 0 && paidRemaining.value === 0) {
    return '所有使用次数已用完'
  } else {
    return '当前操作需要消耗使用次数'
  }
})

const limitMessage = computed(() => {
  if (isGuest.value) {
    return `访客用户每日限制 ${props.usageInfo?.freeUsageLimit || 5} 次免费使用。注册账户可获得更多使用机会！`
  } else if (totalRemaining.value === 0) {
    return '您的免费和付费使用次数都已用完，请购买使用次数包或订阅服务继续使用。'
  } else {
    return '您还有剩余使用次数，是否继续使用？'
  }
})

const primaryActionText = computed(() => {
  if (isGuest.value) {
    return '立即注册'
  } else if (totalRemaining.value === 0) {
    return '购买次数包'
  } else {
    return '确定使用'
  }
})

// 方法
const handleClose = () => {
  visible.value = false
}

const handleRegister = () => {
  emit('register')
  handleClose()
}

const handlePurchase = () => {
  emit('purchase')
  handleClose()
}

const handleSubscribe = () => {
  emit('subscribe')
  handleClose()
}

const handlePrimaryAction = () => {
  if (isGuest.value) {
    handleRegister()
  } else if (totalRemaining.value === 0) {
    handlePurchase()
  } else {
    // 确认使用
    emit('confirm-usage')
    handleClose()
  }
}
</script>

<style scoped>
.usage-limit-dialog {
  --el-dialog-border-radius: 12px;
}

.usage-limit-container {
  padding: 20px 0;
}

/* 图标和标题区域 */
.limit-icon-section {
  text-align: center;
  margin-bottom: 25px;
}

.limit-icon {
  color: #f56c6c;
  margin-bottom: 15px;
}

.limit-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.limit-message {
  margin: 0 0 20px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 使用统计卡片 */
.usage-stats {
  margin-bottom: 25px;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value.highlight {
  color: var(--el-color-primary);
}

/* 升级建议卡片 */
.upgrade-suggestions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.suggestion-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.suggestion-card.subscription {
  background: linear-gradient(135deg, var(--el-color-success-light-9), var(--el-color-success-light-8));
  border-color: var(--el-color-success-light-5);
}

.suggestion-icon {
  font-size: 32px;
  line-height: 1;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.suggestion-content p {
  margin: 0 0 15px 0;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.4;
}

.suggestion-btn {
  width: 100%;
  margin-top: 10px;
}

/* 套餐选项 */
.package-options,
.subscription-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.package-item,
.sub-item {
  flex: 1;
  padding: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  text-align: center;
  position: relative;
}

.package-item.recommended,
.sub-item.popular {
  border-color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.package-badge,
.sub-badge {
  position: absolute;
  top: -8px;
  right: 8px;
  background: var(--el-color-warning);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.package-name,
.sub-name {
  display: block;
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.package-desc,
.sub-desc {
  font-size: 11px;
  color: var(--el-text-color-regular);
}

/* 推荐码提醒 */
.referral-reminder {
  margin-top: 20px;
}

.referral-reminder .el-alert {
  background: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-7);
}

.referral-reminder strong {
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.dialog-footer .el-button {
  flex: 1;
}

.primary-action-btn {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
}

/* 响应式设计 */
@media (max-width: 480px) {
  .usage-limit-dialog {
    --el-dialog-width: 90vw !important;
  }

  .usage-limit-container {
    padding: 10px 0;
  }

  .stats-card {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }

  .suggestion-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .package-options,
  .subscription-options {
    flex-direction: column;
  }

  .dialog-footer {
    flex-direction: column;
  }
}
</style>