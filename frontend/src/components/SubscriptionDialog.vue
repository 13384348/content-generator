<template>
  <el-dialog
    v-model="visible"
    title="订阅服务"
    width="520px"
    :before-close="handleClose"
    class="subscription-dialog"
  >
    <div class="subscription-container">
      <!-- 订阅计划 -->
      <div class="plans-section">
        <h3 class="section-title">选择订阅计划</h3>
        <div class="plans-grid">
          <div
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            :class="['plan-card', { 'selected': selectedPlan?.id === plan.id, 'popular': plan.popular }]"
            @click="selectPlan(plan)"
          >
            <div class="plan-badge" v-if="plan.popular">热门</div>
            <div class="plan-header">
              <div class="plan-name">{{ plan.name }}</div>
              <div class="plan-price">
                <span class="price-amount">¥{{ plan.price }}</span>
                <span class="price-unit">/月</span>
              </div>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <el-icon class="feature-icon"><Check /></el-icon>
                <span>{{ plan.monthlyUsage }}次/月</span>
              </div>
              <div class="feature-item" v-for="feature in plan.features" :key="feature">
                <el-icon class="feature-icon"><Check /></el-icon>
                <span>{{ feature }}</span>
              </div>
            </div>
            <div class="plan-desc">{{ plan.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 订阅周期 -->
      <div class="billing-cycle" v-if="selectedPlan">
        <h3 class="section-title">计费周期</h3>
        <div class="cycle-options">
          <div
            v-for="cycle in billingCycles"
            :key="cycle.id"
            :class="['cycle-card', { 'selected': selectedCycle?.id === cycle.id }]"
            @click="selectCycle(cycle)"
          >
            <div class="cycle-header">
              <div class="cycle-name">{{ cycle.name }}</div>
              <div class="cycle-discount" v-if="cycle.discount">{{ cycle.discount }}</div>
            </div>
            <div class="cycle-price">
              ¥{{ calculatePrice() }} {{ cycle.unit }}
            </div>
            <div class="cycle-desc" v-if="cycle.desc">{{ cycle.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods" v-if="selectedPlan && selectedCycle">
        <h3 class="section-title">支付方式</h3>
        <div class="payment-options">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            :class="['payment-card', { 'selected': selectedPayment?.id === method.id }]"
            @click="selectPayment(method)"
          >
            <div class="payment-icon">{{ method.icon }}</div>
            <div class="payment-name">{{ method.name }}</div>
          </div>
        </div>
      </div>

      <!-- 订阅信息 -->
      <div class="subscription-summary" v-if="selectedPlan && selectedCycle">
        <h3 class="section-title">订阅信息</h3>
        <div class="summary-card">
          <div class="summary-item">
            <span class="summary-label">订阅计划</span>
            <span class="summary-value">{{ selectedPlan.name }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">计费周期</span>
            <span class="summary-value">{{ selectedCycle.name }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">每月可用次数</span>
            <span class="summary-value">{{ selectedPlan.monthlyUsage }}次</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">支付方式</span>
            <span class="summary-value">{{ selectedPayment?.name || '请选择' }}</span>
          </div>
          <div class="summary-item total">
            <span class="summary-label">{{ selectedCycle.name }}费用</span>
            <span class="summary-value">¥{{ calculatePrice() }}</span>
          </div>
        </div>

        <div class="subscription-note">
          <el-alert
            title="订阅说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul class="note-list">
                <li>订阅将自动续费，可随时取消</li>
                <li>使用次数每月1号重置</li>
                <li>未使用次数不累积到下月</li>
                <li>取消订阅后仍可使用至当前周期结束</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">
          取消
        </el-button>
        <el-button
          type="success"
          @click="handleSubscribe"
          size="large"
          :disabled="!canSubscribe"
          :loading="processing"
        >
          立即订阅
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Store
const userStore = useUserStore()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedPlan = ref(null)
const selectedCycle = ref(null)
const selectedPayment = ref(null)
const processing = ref(false)

// 订阅计划
const subscriptionPlans = [
  {
    id: 'standard',
    name: '标准版',
    price: 29,
    monthlyUsage: 200,
    features: [
      '优先处理',
      '邮件支持'
    ],
    desc: '适合个人用户'
  },
  {
    id: 'professional',
    name: '专业版',
    price: 79,
    monthlyUsage: 600,
    popular: true,
    features: [
      '优先处理',
      '高级模板',
      '批量操作',
      '专属客服'
    ],
    desc: '最受欢迎的选择'
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: 199,
    monthlyUsage: 2000,
    features: [
      '最高优先级',
      '定制模板',
      'API接口',
      '专属客服',
      '数据导出'
    ],
    desc: '适合团队协作'
  }
]

// 计费周期
const billingCycles = [
  {
    id: 'monthly',
    name: '按月付费',
    unit: '/月',
    multiplier: 1,
    desc: '灵活取消'
  },
  {
    id: 'quarterly',
    name: '按季付费',
    unit: '/季',
    multiplier: 3,
    discount: '9折优惠',
    discountRate: 0.9,
    desc: '节省10%费用'
  },
  {
    id: 'yearly',
    name: '按年付费',
    unit: '/年',
    multiplier: 12,
    discount: '8折优惠',
    discountRate: 0.8,
    desc: '节省20%费用'
  }
]

// 支付方式
const paymentMethods = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: '💰'
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: '💳'
  }
]

// 计算属性
const canSubscribe = computed(() => {
  return selectedPlan.value && selectedCycle.value && selectedPayment.value && !processing.value
})

// 方法
const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const selectCycle = (cycle) => {
  selectedCycle.value = cycle
}

const selectPayment = (method) => {
  selectedPayment.value = method
}

const calculatePrice = () => {
  if (!selectedPlan.value || !selectedCycle.value) return 0

  const basePrice = selectedPlan.value.price * selectedCycle.value.multiplier
  const discountRate = selectedCycle.value.discountRate || 1
  return Math.round(basePrice * discountRate)
}

const handleSubscribe = async () => {
  if (!canSubscribe.value) return

  try {
    const totalPrice = calculatePrice()
    const confirmed = await ElMessageBox.confirm(
      `确认订阅${selectedPlan.value.name}（${selectedCycle.value.name}，¥${totalPrice}）吗？`,
      '确认订阅',
      {
        confirmButtonText: '确认订阅',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirmed) {
      processing.value = true

      const subscriptionData = {
        planId: selectedPlan.value.id,
        cycleId: selectedCycle.value.id,
        paymentMethod: selectedPayment.value.id,
        amount: totalPrice,
        monthlyUsage: selectedPlan.value.monthlyUsage,
        features: selectedPlan.value.features
      }

      const result = await userStore.createSubscription(subscriptionData)

      if (result.success) {
        // 模拟跳转到支付页面
        await simulateSubscriptionPayment(result.data.subscriptionId)
      } else {
        ElMessage.error(result.error || '创建订阅失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('订阅过程中出现错误')
      console.error('Subscription error:', error)
    }
  } finally {
    processing.value = false
  }
}

const simulateSubscriptionPayment = async (subscriptionId) => {
  // 模拟支付过程
  ElMessage.info('正在跳转到支付页面...')

  // 模拟支付延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 模拟支付结果
  const paymentSuccess = Math.random() > 0.1 // 90% 成功率

  if (paymentSuccess) {
    const result = await userStore.confirmSubscription(subscriptionId)
    if (result.success) {
      ElMessage.success('订阅成功！欢迎使用会员服务')
      emit('success')
      handleClose()
    } else {
      ElMessage.error('订阅确认失败，请联系客服')
    }
  } else {
    ElMessage.error('支付失败，请重试')
  }
}

const handleClose = () => {
  selectedPlan.value = null
  selectedCycle.value = null
  selectedPayment.value = null
  processing.value = false
  visible.value = false
}
</script>

<style scoped>
.subscription-dialog {
  --el-dialog-border-radius: 12px;
}

.subscription-container {
  padding: 20px 0;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 订阅计划 */
.plans-section {
  margin-bottom: 30px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.plan-card {
  position: relative;
  padding: 20px 15px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.plan-card:hover {
  border-color: var(--el-color-success-light-5);
}

.plan-card.selected {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.plan-card.popular {
  border-color: var(--el-color-warning);
}

.plan-badge {
  position: absolute;
  top: -8px;
  right: 10px;
  background: var(--el-color-warning);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.plan-header {
  margin-bottom: 15px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.plan-price {
  margin-bottom: 15px;
}

.price-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-success);
}

.price-unit {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.plan-features {
  margin-bottom: 15px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.feature-icon {
  color: var(--el-color-success);
  margin-right: 8px;
  font-size: 12px;
}

.plan-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 计费周期 */
.billing-cycle {
  margin-bottom: 30px;
}

.cycle-options {
  display: flex;
  gap: 15px;
}

.cycle-card {
  flex: 1;
  padding: 15px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.cycle-card:hover {
  border-color: var(--el-color-success-light-5);
}

.cycle-card.selected {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.cycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cycle-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.cycle-discount {
  background: var(--el-color-danger);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.cycle-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-success);
  margin-bottom: 5px;
}

.cycle-desc {
  font-size: 11px;
  color: var(--el-text-color-regular);
}

/* 支付方式 */
.payment-methods {
  margin-bottom: 30px;
}

.payment-options {
  display: flex;
  gap: 15px;
}

.payment-card {
  flex: 1;
  padding: 15px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.payment-card:hover {
  border-color: var(--el-color-success-light-5);
}

.payment-card.selected {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.payment-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.payment-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

/* 订阅信息 */
.subscription-summary {
  margin-bottom: 20px;
}

.summary-card {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.total {
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 12px;
  margin-top: 12px;
}

.summary-label {
  color: var(--el-text-color-regular);
}

.summary-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.summary-item.total .summary-value {
  font-size: 18px;
  color: var(--el-color-success);
}

/* 订阅说明 */
.subscription-note .el-alert {
  background: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-7);
}

.note-list {
  margin: 0;
  padding-left: 20px;
}

.note-list li {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 3px;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  gap: 15px;
}

.dialog-footer .el-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .subscription-dialog {
    --el-dialog-width: 90vw !important;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .cycle-options,
  .payment-options {
    flex-direction: column;
  }

  .cycle-header {
    flex-direction: column;
    gap: 5px;
  }
}
</style>